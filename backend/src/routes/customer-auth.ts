import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { sendEmail, passwordResetEmail } from '../services/email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const router = Router();

function signCustomerToken(customerId: number, email: string): string {
  return jwt.sign({ id: customerId, email, type: 'customer' }, JWT_SECRET, { expiresIn: '365d' });
}

// POST /api/customer-auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const existing = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
  
  if (existing.rows.length > 0) {
    // Customer exists (created via checkout) — set password
    const customer = existing.rows[0];
    const existingPw = await pool.query('SELECT password_hash FROM customers WHERE id = $1', [customer.id]);
    if (existingPw.rows[0]?.password_hash) {
      return res.status(409).json({ error: 'Аккаунт уже существует. Войдите.' });
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE customers SET password_hash = $1, name = COALESCE(NULLIF($2, \'\'), name), phone = COALESCE(NULLIF($3, \'\'), phone) WHERE id = $4',
      [hash, name || '', phone || '', customer.id],
    );
    const token = signCustomerToken(customer.id, email);
    const user = await pool.query('SELECT id, email, name, phone FROM customers WHERE id = $1', [customer.id]);
    return res.json({ token, user: user.rows[0] });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    'INSERT INTO customers (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone',
    [email, hash, name || '', phone || ''],
  );

  const token = signCustomerToken(result.rows[0].id, email);
  res.status(201).json({ token, user: result.rows[0] });
});

// POST /api/customer-auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
  const customer = result.rows[0];

  if (!customer) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  if (!customer.password_hash) {
    return res.status(401).json({ error: 'Для этого аккаунта не задан пароль. Зарегистрируйтесь.' });
  }

  const valid = await bcrypt.compare(password, customer.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const token = signCustomerToken(customer.id, customer.email);
  res.json({
    token,
    user: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone },
  });
});

// GET /api/customer-auth/me
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; email: string; type: string };
    if (decoded.type !== 'customer') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }
    const result = await pool.query('SELECT id, email, name, phone FROM customers WHERE id = $1', [decoded.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
});

// PATCH /api/customer-auth/profile
router.patch('/profile', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; type: string };
    if (decoded.type !== 'customer') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }

    const { name, phone } = req.body;
    await pool.query(
      'UPDATE customers SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
      [name, phone, decoded.id],
    );

    const result = await pool.query('SELECT id, email, name, phone FROM customers WHERE id = $1', [decoded.id]);
    res.json(result.rows[0]);
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
});

// POST /api/customer-auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  try {
    const result = await pool.query('SELECT id, name, password_hash FROM customers WHERE email = $1', [email]);
    if (!result.rows.length || !result.rows[0].password_hash) {
      // Don't reveal if account exists
      return res.json({ ok: true });
    }

    const customer = result.rows[0];
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
      `CREATE TABLE IF NOT EXISTS password_reset_codes (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
    );

    // Invalidate previous codes
    await pool.query('UPDATE password_reset_codes SET used = TRUE WHERE customer_id = $1 AND used = FALSE', [customer.id]);

    await pool.query(
      'INSERT INTO password_reset_codes (customer_id, code, expires_at) VALUES ($1, $2, $3)',
      [customer.id, code, expiresAt],
    );

    const emailData = passwordResetEmail({ name: customer.name || 'Клиент', resetCode: code });
    await sendEmail(email, emailData.subject, emailData.html);

    res.json({ ok: true });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/customer-auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  }

  try {
    const customerRes = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
    if (!customerRes.rows.length) {
      return res.status(400).json({ error: 'Неверный код' });
    }

    const customerId = customerRes.rows[0].id;
    const codeRes = await pool.query(
      'SELECT id FROM password_reset_codes WHERE customer_id = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()',
      [customerId, code],
    );

    if (!codeRes.rows.length) {
      return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE customers SET password_hash = $1 WHERE id = $2', [hash, customerId]);
    await pool.query('UPDATE password_reset_codes SET used = TRUE WHERE customer_id = $1', [customerId]);

    res.json({ ok: true });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/customer-auth/change-password
router.post('/change-password', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; type: string };
    if (decoded.type !== 'customer') {
      return res.status(401).json({ error: 'Невалидный токен' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль минимум 6 символов' });
    }

    const result = await pool.query('SELECT password_hash FROM customers WHERE id = $1', [decoded.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Пользователь не найден' });

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE customers SET password_hash = $1 WHERE id = $2', [hash, decoded.id]);

    res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Невалидный токен' });
  }
});

export default router;

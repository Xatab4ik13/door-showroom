import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const router = Router();

function signCustomerToken(customerId: number, email: string): string {
  return jwt.sign({ id: customerId, email, type: 'customer' }, JWT_SECRET, { expiresIn: '30d' });
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

export default router;

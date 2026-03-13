import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { signToken, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// POST /api/auth/register (first admin only)
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await pool.query('SELECT COUNT(*) FROM admin_users');
  if (Number(existing.rows[0].count) > 0) {
    return res.status(403).json({ error: 'Регистрация закрыта. Используйте существующий аккаунт.' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    'INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, hash, name],
  );

  const token = signToken(result.rows[0].id);
  res.json({ token, user: result.rows[0] });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const result = await pool.query('SELECT id, email, name FROM admin_users WHERE id = $1', [req.adminId]);
  res.json(result.rows[0] || null);
});

export default router;

import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = Router();

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS measure_leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT,
      comment TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureTable().catch(console.error);

// Public: клиент отправляет заявку на замер
router.post('/', async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 200);
  const phone = String(req.body?.phone || '').trim().slice(0, 50);
  const address = String(req.body?.address || '').trim().slice(0, 500) || null;
  const comment = String(req.body?.comment || '').trim().slice(0, 1000) || null;

  if (!name || !phone) return res.status(400).json({ error: 'Имя и телефон обязательны' });

  const r = await pool.query(
    `INSERT INTO measure_leads (name, phone, address, comment) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, phone, address, comment],
  );

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminEmail) {
    sendEmail(
      adminEmail,
      'Новая заявка на замер',
      `<h2>Новая заявка на замер</h2>
       <p><b>Имя:</b> ${name}</p>
       <p><b>Телефон:</b> ${phone}</p>
       <p><b>Адрес:</b> ${address || '—'}</p>
       <p><b>Комментарий:</b> ${comment || '—'}</p>`,
    ).catch((e) => console.error('lead email failed', e));
  }

  res.status(201).json(r.rows[0]);
});

// Admin
router.get('/', requireAuth, async (_req, res) => {
  const r = await pool.query('SELECT * FROM measure_leads ORDER BY created_at DESC LIMIT 500');
  res.json(r.rows);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const status = String(req.body?.status || 'new').slice(0, 30);
  const r = await pool.query('UPDATE measure_leads SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

export default router;

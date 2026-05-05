import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Generic JSON content store — key/value JSONB.
 * Used for: hero slides, popular products list, advantages, page content, etc.
 *
 * Frontend reads via GET /api/content/:key
 * Admin writes via PUT /api/content/:key
 */

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureTable().catch(console.error);

router.get('/:key', async (req, res) => {
  const r = await pool.query('SELECT value FROM site_content WHERE key = $1', [req.params.key]);
  if (!r.rows[0]) return res.json(null);
  res.json(r.rows[0].value);
});

router.put('/:key', requireAuth, async (req, res) => {
  await pool.query(
    `INSERT INTO site_content (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [req.params.key, req.body],
  );
  res.json({ ok: true });
});

export default router;

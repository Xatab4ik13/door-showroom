import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public — list categories with parent info
router.get('/', async (_req, res) => {
  const r = await pool.query(
    `SELECT c.id, c.slug, c.name, c.parent_id, c.sort_order,
       (SELECT COUNT(*)::int
        FROM products p
        LEFT JOIN categories child ON child.id = p.category_id
        WHERE p.sync_status='active'
          AND (p.category_id = c.id OR child.parent_id = c.id)) AS product_count
     FROM categories c
     ORDER BY c.parent_id NULLS FIRST, c.sort_order, c.name`,
  );
  res.json(r.rows);
});

// Admin — create
router.post('/', requireAuth, async (req, res) => {
  const { slug, name, parent_id = null, sort_order = 0 } = req.body;
  if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
  try {
    const r = await pool.query(
      `INSERT INTO categories (slug, name, parent_id, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [slug, name, parent_id, sort_order],
    );
    res.json(r.rows[0]);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Admin — update
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['slug', 'name', 'parent_id', 'sort_order'];
  const fields: string[] = [];
  const params: any[] = [];
  for (const k of allowed) {
    if (req.body[k] === undefined) continue;
    params.push(req.body[k]);
    fields.push(`${k} = $${params.length}`);
  }
  if (!fields.length) return res.status(400).json({ error: 'No fields' });
  params.push(req.params.id);
  await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${params.length}`, params);
  res.json({ ok: true });
});

// Admin — delete (only if empty)
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const used = await pool.query(
    `SELECT COUNT(*)::int AS n FROM products WHERE category_id = $1 AND sync_status='active'`,
    [id],
  );
  if (used.rows[0].n > 0) {
    return res.status(400).json({ error: 'Категория не пустая. Сначала переместите товары.' });
  }
  await pool.query('UPDATE categories SET parent_id = NULL WHERE parent_id = $1', [id]);
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  res.json({ ok: true });
});

export default router;

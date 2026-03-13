import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products — public listing
router.get('/', async (req, res) => {
  const { supplier, category, search, page = '1', limit = '20' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const conditions: string[] = ["p.sync_status = 'active'"];
  const params: any[] = [];

  if (supplier) {
    params.push(supplier);
    conditions.push(`s.slug = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.name ILIKE $${params.length} OR p.source_sku ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(Number(limit), offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT p.*, s.name as supplier_name, s.slug as supplier_slug, c.name as category_name
       FROM products p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.updated_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    ),
    pool.query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}`,
      params.slice(0, -2),
    ),
  ]);

  res.json({
    products: dataRes.rows,
    total: Number(countRes.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, s.name as supplier_name, s.slug as supplier_slug, c.name as category_name
     FROM products p
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1`,
    [req.params.slug],
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Товар не найден' });
  res.json(result.rows[0]);
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  await pool.query("UPDATE products SET sync_status = 'removed' WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;

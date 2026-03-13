import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/suppliers
router.get('/', requireAuth, async (_req, res) => {
  const result = await pool.query(`
    SELECT s.*,
      (SELECT COUNT(*) FROM products WHERE supplier_id = s.id AND sync_status = 'active') as product_count,
      (SELECT MAX(finished_at) FROM sync_log WHERE supplier_id = s.id AND status = 'completed') as last_successful_sync
    FROM suppliers s
    ORDER BY s.id
  `);
  res.json(result.rows);
});

// GET /api/suppliers/:slug/stats
router.get('/:slug/stats', requireAuth, async (req, res) => {
  const supplier = await pool.query('SELECT * FROM suppliers WHERE slug = $1', [req.params.slug]);
  if (!supplier.rows[0]) return res.status(404).json({ error: 'Поставщик не найден' });

  const sid = supplier.rows[0].id;
  const [products, logs] = await Promise.all([
    pool.query(`
      SELECT sync_status, COUNT(*) as count
      FROM products WHERE supplier_id = $1
      GROUP BY sync_status
    `, [sid]),
    pool.query(`
      SELECT * FROM sync_log WHERE supplier_id = $1
      ORDER BY started_at DESC LIMIT 10
    `, [sid]),
  ]);

  res.json({
    supplier: supplier.rows[0],
    productStats: products.rows,
    recentSyncs: logs.rows,
  });
});

// PUT /api/suppliers/:slug
router.put('/:slug', requireAuth, async (req, res) => {
  const { name, format, api_url, api_key, sync_enabled } = req.body;
  const result = await pool.query(
    `UPDATE suppliers SET name = COALESCE($1, name), format = COALESCE($2, format),
     api_url = COALESCE($3, api_url), api_key = COALESCE($4, api_key),
     sync_enabled = COALESCE($5, sync_enabled)
     WHERE slug = $6 RETURNING *`,
    [name, format, api_url, api_key, sync_enabled, req.params.slug],
  );
  res.json(result.rows[0]);
});

export default router;

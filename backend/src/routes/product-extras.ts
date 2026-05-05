import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/product-extras/:productId
 * Returns panel colors, services, and recommended products for a given product,
 * merged from product-level + category-level entries.
 */
router.get('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId) return res.status(400).json({ error: 'Bad product id' });

  const prodRes = await pool.query(
    `SELECT p.id, p.category_id, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [productId],
  );
  const product = prodRes.rows[0];
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const categorySlug = product.category_slug as string | null;

  const [colorsRes, servicesRes, excludesRes, recoProdRes, recoCatRes] = await Promise.all([
    pool.query(
      `SELECT id, name, image_url, price_modifier, sort_order
       FROM panel_colors
       WHERE product_id = $1 OR (product_id IS NULL AND category_slug = $2)
       ORDER BY sort_order, id`,
      [productId, categorySlug],
    ),
    pool.query(
      `SELECT id, name, description, price, price_type, sort_order, product_id, category_slug
       FROM services
       WHERE product_id = $1 OR (product_id IS NULL AND category_slug = $2)
       ORDER BY sort_order, id`,
      [productId, categorySlug],
    ),
    pool.query(`SELECT service_id FROM product_service_excludes WHERE product_id = $1`, [productId]),
    pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.images
       FROM product_recommendations r
       JOIN products p ON p.id = r.recommended_product_id AND p.sync_status = 'active'
       WHERE r.source_product_id = $1
       ORDER BY r.sort_order, r.id LIMIT 12`,
      [productId],
    ),
    categorySlug
      ? pool.query(
          `SELECT p.id, p.name, p.slug, p.price, p.images
           FROM product_recommendations r
           JOIN products p ON p.id = r.recommended_product_id AND p.sync_status = 'active'
           WHERE r.source_category_slug = $1 AND r.source_product_id IS NULL
           ORDER BY r.sort_order, r.id LIMIT 12`,
          [categorySlug],
        )
      : Promise.resolve({ rows: [] as any[] }),
  ]);

  const excludeSet = new Set(excludesRes.rows.map(r => r.service_id));
  const services = servicesRes.rows.filter(s => !excludeSet.has(s.id));

  // Merge recommendations: product-level first, then category-level (deduped)
  const seen = new Set<number>();
  const recommendations = [...recoProdRes.rows, ...recoCatRes.rows].filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  res.json({
    panel_colors: colorsRes.rows,
    services,
    recommendations,
  });
});

// ============== ADMIN CRUD ==============

// Panel colors
router.post('/admin/colors', requireAuth, async (req, res) => {
  const { category_slug, product_id, name, image_url, price_modifier = 0, sort_order = 0 } = req.body;
  const r = await pool.query(
    `INSERT INTO panel_colors (category_slug, product_id, name, image_url, price_modifier, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [category_slug || null, product_id || null, name, image_url || null, price_modifier, sort_order],
  );
  res.json(r.rows[0]);
});
router.delete('/admin/colors/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM panel_colors WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});
router.get('/admin/colors', requireAuth, async (req, res) => {
  const { category_slug, product_id } = req.query;
  const conds: string[] = []; const params: any[] = [];
  if (category_slug) { params.push(category_slug); conds.push(`category_slug = $${params.length}`); }
  if (product_id) { params.push(product_id); conds.push(`product_id = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const r = await pool.query(`SELECT * FROM panel_colors ${where} ORDER BY sort_order, id`, params);
  res.json(r.rows);
});

// Services
router.post('/admin/services', requireAuth, async (req, res) => {
  const { category_slug, product_id, name, description, price = 0, price_type = 'fixed', sort_order = 0 } = req.body;
  const r = await pool.query(
    `INSERT INTO services (category_slug, product_id, name, description, price, price_type, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [category_slug || null, product_id || null, name, description || null, price, price_type, sort_order],
  );
  res.json(r.rows[0]);
});
router.delete('/admin/services/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});
router.get('/admin/services', requireAuth, async (req, res) => {
  const { category_slug, product_id } = req.query;
  const conds: string[] = []; const params: any[] = [];
  if (category_slug) { params.push(category_slug); conds.push(`category_slug = $${params.length}`); }
  if (product_id) { params.push(product_id); conds.push(`product_id = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const r = await pool.query(`SELECT * FROM services ${where} ORDER BY sort_order, id`, params);
  res.json(r.rows);
});

// Recommendations
router.post('/admin/recommendations', requireAuth, async (req, res) => {
  const { source_product_id, source_category_slug, recommended_product_id, sort_order = 0 } = req.body;
  const r = await pool.query(
    `INSERT INTO product_recommendations (source_product_id, source_category_slug, recommended_product_id, sort_order)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [source_product_id || null, source_category_slug || null, recommended_product_id, sort_order],
  );
  res.json(r.rows[0]);
});
router.delete('/admin/recommendations/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM product_recommendations WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;

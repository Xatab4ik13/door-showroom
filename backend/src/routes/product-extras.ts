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

  const [colorsRes, servicesRes, svcExclRes, colorExclRes, recoProdRes, recoCatRes] = await Promise.all([
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
    pool.query(`SELECT color_id FROM product_color_excludes WHERE product_id = $1`, [productId]),
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

  const svcExcludeSet = new Set(svcExclRes.rows.map(r => r.service_id));
  const colorExcludeSet = new Set(colorExclRes.rows.map(r => r.color_id));
  const services = servicesRes.rows.filter(s => !svcExcludeSet.has(s.id));
  const panel_colors = colorsRes.rows.filter(c => !colorExcludeSet.has(c.id));

  // Merge recommendations: product-level first, then category-level (deduped)
  const seen = new Set<number>();
  const recommendations = [...recoProdRes.rows, ...recoCatRes.rows].filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  res.json({
    panel_colors,
    services,
    recommendations,
  });
});

// GET admin excludes for a product
router.get('/admin/excludes/:productId', requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId) return res.status(400).json({ error: 'Bad product id' });
  const [svc, col] = await Promise.all([
    pool.query(`SELECT service_id FROM product_service_excludes WHERE product_id = $1`, [productId]),
    pool.query(`SELECT color_id FROM product_color_excludes WHERE product_id = $1`, [productId]),
  ]);
  res.json({
    services: svc.rows.map(r => r.service_id),
    colors: col.rows.map(r => r.color_id),
  });
});

// PUT admin excludes (replace) — body: { services: number[], colors: number[] }
router.put('/admin/excludes/:productId', requireAuth, async (req, res) => {
  const productId = Number(req.params.productId);
  if (!productId) return res.status(400).json({ error: 'Bad product id' });
  const services: number[] = Array.isArray(req.body?.services) ? req.body.services.map(Number).filter(Boolean) : [];
  const colors: number[] = Array.isArray(req.body?.colors) ? req.body.colors.map(Number).filter(Boolean) : [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM product_service_excludes WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_color_excludes WHERE product_id = $1', [productId]);
    for (const sid of services) {
      await client.query(
        'INSERT INTO product_service_excludes (product_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [productId, sid],
      );
    }
    for (const cid of colors) {
      await client.query(
        'INSERT INTO product_color_excludes (product_id, color_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [productId, cid],
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Save failed' });
  } finally {
    client.release();
  }
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

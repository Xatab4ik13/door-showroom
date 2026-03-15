import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/products — public listing with filters & pagination
router.get('/', async (req, res) => {
  const {
    supplier, category, search,
    page = '1', limit = '20',
    price_min, price_max,
    manufacturer, material, color,
    sort = 'updated_at', order = 'desc',
  } = req.query;

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
    conditions.push(`(p.name ILIKE $${params.length} OR p.source_sku ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.material ILIKE $${params.length} OR p.color ILIKE $${params.length} OR p.specs::text ILIKE $${params.length})`);
  }
  if (price_min) {
    params.push(Number(price_min));
    conditions.push(`p.price >= $${params.length}`);
  }
  if (price_max) {
    params.push(Number(price_max));
    conditions.push(`p.price <= $${params.length}`);
  }
  if (manufacturer) {
    const mfrs = String(manufacturer).split(',').map(s => s.trim()).filter(Boolean);
    if (mfrs.length === 1) {
      params.push(mfrs[0]);
      conditions.push(`p.manufacturer = $${params.length}`);
    } else {
      params.push(mfrs);
      conditions.push(`p.manufacturer = ANY($${params.length})`);
    }
  }
  if (material) {
    const mats = String(material).split(',').map(s => s.trim()).filter(Boolean);
    if (mats.length === 1) {
      params.push(`%${mats[0]}%`);
      conditions.push(`p.material ILIKE $${params.length}`);
    } else {
      const matConditions = mats.map((m, i) => {
        params.push(`%${m}%`);
        return `p.material ILIKE $${params.length}`;
      });
      conditions.push(`(${matConditions.join(' OR ')})`);
    }
  }
  if (color) {
    const cols = String(color).split(',').map(s => s.trim()).filter(Boolean);
    if (cols.length === 1) {
      params.push(`%${cols[0]}%`);
      conditions.push(`p.color ILIKE $${params.length}`);
    } else {
      const colConditions = cols.map((c, i) => {
        params.push(`%${c}%`);
        return `p.color ILIKE $${params.length}`;
      });
      conditions.push(`(${colConditions.join(' OR ')})`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sort options
  const allowedSorts: Record<string, string> = {
    updated_at: 'p.updated_at',
    price: 'p.price',
    name: 'p.name',
  };
  const sortCol = allowedSorts[String(sort)] || 'p.updated_at';
  const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  params.push(Number(limit), offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query(
      `SELECT p.*, s.name as supplier_name, s.slug as supplier_slug, c.name as category_name
       FROM products p
       LEFT JOIN suppliers s ON s.id = p.supplier_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY ${sortCol} ${sortOrder}
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

  // Strip internal fields from specs before sending (keep _sizes, _accessories for frontend)
  const products = dataRes.rows.map((row: any) => {
    if (row.specs && typeof row.specs === 'object') {
      const { source_url, supplier_url, xml_url, import_url, sync_id, ...cleanSpecs } = row.specs;
      row.specs = cleanSpecs;
    }
    return row;
  });

  res.json({
    products,
    total: Number(countRes.rows[0].count),
    page: Number(page),
    limit: Number(limit),
  });
});

// GET /api/products/facets — distinct filter values
router.get('/facets', async (_req, res) => {
  const [mfr, mat, col, cat] = await Promise.all([
    pool.query(
      `SELECT DISTINCT manufacturer FROM products WHERE sync_status = 'active' AND manufacturer IS NOT NULL ORDER BY manufacturer`
    ),
    pool.query(
      `SELECT DISTINCT material FROM products WHERE sync_status = 'active' AND material IS NOT NULL ORDER BY material`
    ),
    pool.query(
      `SELECT DISTINCT color FROM products WHERE sync_status = 'active' AND color IS NOT NULL ORDER BY color`
    ),
    pool.query(
      `SELECT c.slug, c.name, COUNT(p.id)::int as count
       FROM categories c
       JOIN products p ON p.category_id = c.id AND p.sync_status = 'active'
       GROUP BY c.slug, c.name
       ORDER BY count DESC`
    ),
  ]);

  res.json({
    manufacturers: mfr.rows.map(r => r.manufacturer),
    materials: mat.rows.map(r => r.material),
    colors: col.rows.map(r => r.color),
    categories: cat.rows,
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
  const product = result.rows[0];
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  // Strip internal fields from specs
  if (product.specs && typeof product.specs === 'object') {
    const { source_url, supplier_url, xml_url, import_url, sync_id, ...cleanSpecs } = product.specs;
    product.specs = cleanSpecs;
  }
  res.json(product);
});

// PATCH /api/products/:id (admin — edit product)
router.patch('/:id', requireAuth, async (req, res) => {
  const { name, price, old_price, description } = req.body;
  const fields: string[] = [];
  const params: any[] = [];

  if (name !== undefined) { params.push(name); fields.push(`name = $${params.length}`); }
  if (price !== undefined) { params.push(price); fields.push(`price = $${params.length}`); }
  if (old_price !== undefined) { params.push(old_price); fields.push(`old_price = $${params.length}`); }
  if (description !== undefined) { params.push(description); fields.push(`description = $${params.length}`); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push('updated_at = NOW()');
  params.push(req.params.id);

  await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${params.length}`,
    params,
  );
  res.json({ ok: true });
});

// DELETE /api/products/:id (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  await pool.query("UPDATE products SET sync_status = 'removed' WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

export default router;

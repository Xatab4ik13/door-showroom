import { Router } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { parseStringPromise } from 'xml2js';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { syncDverCom } from '../services/dvercom-sync.js';
import { scrapeAllProducts } from '../services/dvercom-scraper.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/import/csv — manual CSV upload for any supplier
router.post('/csv', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

  const supplierSlug = req.body.supplier;
  const supplier = await pool.query('SELECT * FROM suppliers WHERE slug = $1', [supplierSlug]);
  if (!supplier.rows[0]) return res.status(400).json({ error: 'Поставщик не найден' });

  try {
    const content = req.file.buffer.toString('utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, delimiter: ';' });
    const mapping = JSON.parse(req.body.mapping || '{}');

    let added = 0, updated = 0;

    for (const row of records) {
      const sku = row[mapping.sku || 'Артикул'] || row['Артикул'];
      if (!sku) continue;

      const name = row[mapping.name || 'Наименование'] || row['Наименование'] || sku;
      const price = parseFloat(row[mapping.price || 'Цена'] || row['Цена'] || '0');
      const slug = sku.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-');

      const result = await pool.query(
        `INSERT INTO products (supplier_id, source_sku, name, slug, price, manufacturer, material, color, in_stock, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
         ON CONFLICT (supplier_id, source_sku) DO UPDATE SET
           name = EXCLUDED.name, price = EXCLUDED.price,
           manufacturer = EXCLUDED.manufacturer, material = EXCLUDED.material,
           color = EXCLUDED.color, in_stock = true, updated_at = NOW(), sync_status = 'active'
         RETURNING (xmax = 0) as is_new`,
        [
          supplier.rows[0].id, sku, name, slug, price,
          row[mapping.manufacturer || 'Производитель'] || null,
          row[mapping.material || 'Материал'] || null,
          row[mapping.color || 'Цвет'] || null,
        ],
      );

      if (result.rows[0]?.is_new) added++; else updated++;
    }

    // Update supplier last sync
    await pool.query('UPDATE suppliers SET last_sync_at = NOW() WHERE id = $1', [supplier.rows[0].id]);

    res.json({ ok: true, added, updated, total: records.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка парсинга: ' + err.message });
  }
});

// POST /api/import/xml — XML upload
router.post('/xml', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

  const supplierSlug = req.body.supplier;
  const supplier = await pool.query('SELECT * FROM suppliers WHERE slug = $1', [supplierSlug]);
  if (!supplier.rows[0]) return res.status(400).json({ error: 'Поставщик не найден' });

  try {
    const content = req.file.buffer.toString('utf-8');
    const xml = await parseStringPromise(content, { explicitArray: false });

    // dver.com XML format: <products><product>...</product></products>
    const items = xml?.products?.product || xml?.yml_catalog?.shop?.offers?.offer || [];
    const products = Array.isArray(items) ? items : [items];

    let added = 0, updated = 0;

    for (const item of products) {
      const sku = item.article || item.$.id || item.sku;
      if (!sku) continue;

      const name = item.name || item.model || sku;
      const price = parseFloat(item.price || '0');
      const slug = sku.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-');
      const imageUrl = item.picture || `https://dver.com/xml/images/${sku}.jpeg`;

      const result = await pool.query(
        `INSERT INTO products (supplier_id, source_sku, name, slug, price, images, in_stock, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
         ON CONFLICT (supplier_id, source_sku) DO UPDATE SET
           name = EXCLUDED.name, price = EXCLUDED.price,
           images = EXCLUDED.images, in_stock = true, updated_at = NOW(), sync_status = 'active'
         RETURNING (xmax = 0) as is_new`,
        [supplier.rows[0].id, sku, name, slug, price, JSON.stringify([imageUrl])],
      );

      if (result.rows[0]?.is_new) added++; else updated++;
    }

    await pool.query('UPDATE suppliers SET last_sync_at = NOW() WHERE id = $1', [supplier.rows[0].id]);
    res.json({ ok: true, added, updated, total: products.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка парсинга XML: ' + err.message });
  }
});

// POST /api/import/sync/dvercom — manual trigger (admin JWT or SYNC_SECRET)
router.post('/sync/dvercom', async (req, res) => {
  // Allow auth via JWT or sync secret (for cron/CLI usage)
  const syncSecret = process.env.SYNC_SECRET || 'rusdoors-sync-2024';
  const header = req.headers.authorization;
  const secretHeader = req.headers['x-sync-secret'];

  if (secretHeader !== syncSecret && !header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const result = await syncDverCom();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

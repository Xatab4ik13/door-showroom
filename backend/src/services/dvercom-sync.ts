import { pool } from '../db/pool.js';
import { parse } from 'csv-parse/sync';

const DVERCOM_CSV_URL = process.env.DVERCOM_CSV_URL || '';

export async function syncDverCom() {
  if (!DVERCOM_CSV_URL) {
    throw new Error('DVERCOM_CSV_URL not configured');
  }

  const supplier = await pool.query("SELECT * FROM suppliers WHERE slug = 'dvercom'");
  if (!supplier.rows[0]) throw new Error('Supplier dvercom not found');
  const supplierId = supplier.rows[0].id;

  // Create sync log entry
  const logResult = await pool.query(
    "INSERT INTO sync_log (supplier_id) VALUES ($1) RETURNING id",
    [supplierId],
  );
  const logId = logResult.rows[0].id;

  try {
    // Fetch CSV from dver.com
    const response = await fetch(DVERCOM_CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      relax_column_count: true,
    });

    // Mark all existing products as potentially stale
    await pool.query(
      "UPDATE products SET sync_status = 'pending' WHERE supplier_id = $1 AND sync_status = 'active'",
      [supplierId],
    );

    let added = 0, updated = 0;

    for (const row of records) {
      const sku = row['Артикул'] || row['article'] || row['SKU'];
      if (!sku) continue;

      const name = row['Наименование'] || row['name'] || row['Название'] || sku;
      const price = parseFloat((row['Цена'] || row['price'] || '0').replace(/[^\d.,]/g, '').replace(',', '.'));
      const slug = `dvercom-${sku}`.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-');
      const imageUrl = `https://dver.com/xml/images/${sku}.jpeg`;

      const result = await pool.query(
        `INSERT INTO products (supplier_id, source_sku, name, slug, price, manufacturer, material, color, images, in_stock, sync_status, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'active', NOW())
         ON CONFLICT (supplier_id, source_sku) DO UPDATE SET
           name = EXCLUDED.name, price = EXCLUDED.price,
           manufacturer = EXCLUDED.manufacturer, material = EXCLUDED.material,
           color = EXCLUDED.color, images = EXCLUDED.images,
           in_stock = true, sync_status = 'active', updated_at = NOW()
         RETURNING (xmax = 0) as is_new`,
        [
          supplierId, sku, name, slug, price,
          row['Производитель'] || row['manufacturer'] || null,
          row['Материал'] || row['material'] || null,
          row['Цвет'] || row['color'] || null,
          JSON.stringify([imageUrl]),
        ],
      );

      if (result.rows[0]?.is_new) added++; else updated++;
    }

    // Products still 'pending' were not in the feed → mark removed
    const removed = await pool.query(
      "UPDATE products SET sync_status = 'removed', in_stock = false WHERE supplier_id = $1 AND sync_status = 'pending'",
      [supplierId],
    );

    // Finish sync log
    await pool.query(
      `UPDATE sync_log SET finished_at = NOW(), status = 'completed',
       products_added = $1, products_updated = $2, products_removed = $3
       WHERE id = $4`,
      [added, updated, removed.rowCount || 0, logId],
    );

    await pool.query('UPDATE suppliers SET last_sync_at = NOW() WHERE id = $1', [supplierId]);

    return { added, updated, removed: removed.rowCount || 0, total: records.length };
  } catch (err: any) {
    await pool.query(
      "UPDATE sync_log SET finished_at = NOW(), status = 'failed', error = $1 WHERE id = $2",
      [err.message, logId],
    );
    throw err;
  }
}

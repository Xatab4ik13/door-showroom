import { pool } from '../db/pool.js';
import { parseStringPromise } from 'xml2js';

// Public YML feed — no auth required
const DVERCOM_YML_URL = process.env.DVERCOM_YML_URL || 'https://dver.com/xml/dver_yml.xml';

// Category mapping from dver.com IDs to our slugs
const CATEGORY_MAP: Record<string, string> = {
  '1': 'mezhkomnatnye',
  '2': 'vhodnye',
  '3': 'furnitura',
};

interface YmlOffer {
  $: { id: string; available?: string };
  url?: string[];
  price?: string[];
  categoryId?: string[];
  categoryid?: string[];
  picture?: string[];
  name?: string[];
  vendor?: string[];
  vendorCode?: string[];
  vendorcode?: string[];
  description?: string[];
  model?: string[];
  param?: Array<{ $: { name: string }; _: string }> | Array<string>;
}

function extractParam(offer: YmlOffer, paramName: string): string | null {
  if (!offer.param) return null;
  for (const p of offer.param) {
    if (typeof p === 'object' && p.$ && p.$.name === paramName) {
      return p._ || null;
    }
  }
  return null;
}

export async function syncDverCom() {
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
    console.log(`[SYNC] Fetching YML from ${DVERCOM_YML_URL}...`);
    const response = await fetch(DVERCOM_YML_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const xmlText = await response.text();
    console.log(`[SYNC] Received ${(xmlText.length / 1024).toFixed(0)} KB of XML`);

    const xml = await parseStringPromise(xmlText, {
      explicitArray: true,
      trim: true,
      normalizeTags: false,
    });

    // Parse categories from YML
    const ymlCategories = xml?.yml_catalog?.shop?.[0]?.categories?.[0]?.category || [];
    const categoryIdMap: Record<string, string> = {};
    for (const cat of ymlCategories) {
      const catId = cat?.$ ?.id;
      const catName = cat?._ || cat;
      if (catId) categoryIdMap[catId] = typeof catName === 'string' ? catName : String(catName);
    }
    console.log(`[SYNC] Found ${Object.keys(categoryIdMap).length} categories`);

    // Ensure categories exist in our DB
    for (const [dvercomId, catName] of Object.entries(categoryIdMap)) {
      const slug = CATEGORY_MAP[dvercomId] || `dvercom-cat-${dvercomId}`;
      await pool.query(
        `INSERT INTO categories (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
        [slug, catName],
      );
    }

    // Get category IDs from our DB
    const dbCategories = await pool.query('SELECT id, slug FROM categories');
    const categorySlugToId: Record<string, number> = {};
    for (const row of dbCategories.rows) {
      categorySlugToId[row.slug] = row.id;
    }

    // Parse offers
    const offers: YmlOffer[] = xml?.yml_catalog?.shop?.[0]?.offers?.[0]?.offer || [];
    console.log(`[SYNC] Found ${offers.length} offers to process`);

    if (offers.length === 0) {
      throw new Error('No offers found in YML feed — possible format change');
    }

    // Mark existing products as pending
    await pool.query(
      "UPDATE products SET sync_status = 'pending' WHERE supplier_id = $1 AND sync_status = 'active'",
      [supplierId],
    );

    let added = 0, updated = 0, skipped = 0;

    // Process in batches for better performance
    const BATCH_SIZE = 50;
    for (let i = 0; i < offers.length; i += BATCH_SIZE) {
      const batch = offers.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (offer) => {
        try {
          const sku = offer.$?.id;
          if (!sku) { skipped++; return; }

          const available = offer.$?.available !== 'false';
          const name = offer.name?.[0] || `Дверь ${sku}`;
          const price = parseFloat(offer.price?.[0] || '0');
          const picture = offer.picture?.[0] || `https://dver.com/xml/images/${sku}.jpeg`;
          const vendor = offer.vendor?.[0] || null;
          const vendorCode = offer.vendorCode?.[0] || offer.vendorcode?.[0] || sku;
          const description = offer.description?.[0] || null;
          const model = offer.model?.[0] || null;
          const sourceUrl = offer.url?.[0] || null;
          
          // Category
          const catId = offer.categoryId?.[0] || offer.categoryid?.[0];
          const catSlug = catId ? (CATEGORY_MAP[catId] || `dvercom-cat-${catId}`) : null;
          const dbCategoryId = catSlug ? (categorySlugToId[catSlug] || null) : null;

          // Extract ALL params from YML (not just hardcoded ones)
          const specsObj: Record<string, string | null> = {};
          if (offer.param && Array.isArray(offer.param)) {
            for (const p of offer.param) {
              if (typeof p === 'object' && p.$ && p.$.name) {
                specsObj[p.$.name] = p._ || null;
              }
            }
          }
          // Add model if not already in params
          if (!specsObj['модель'] && model) specsObj['модель'] = model;
          // Keep source_url for internal use (stripped on API output)
          specsObj['source_url'] = sourceUrl;

          // Build slug: clean, unique, URL-friendly
          const slug = `dvercom-${vendorCode}`.toLowerCase().replace(/[^a-zа-яё0-9-]/gi, '-').replace(/-+/g, '-');

          // Specs JSON — all params from YML
          const specs = JSON.stringify(specsObj);

          const result = await pool.query(
            `INSERT INTO products (supplier_id, source_sku, name, slug, category_id, description, price, manufacturer, images, in_stock, specs, sync_status, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW())
             ON CONFLICT (supplier_id, source_sku) DO UPDATE SET
               name = EXCLUDED.name, price = EXCLUDED.price,
               category_id = COALESCE(EXCLUDED.category_id, products.category_id),
               description = EXCLUDED.description,
               manufacturer = EXCLUDED.manufacturer,
               images = EXCLUDED.images,
               in_stock = EXCLUDED.in_stock,
               specs = EXCLUDED.specs,
               sync_status = 'active', updated_at = NOW()
             RETURNING (xmax = 0) as is_new`,
            [
              supplierId, vendorCode, name, slug, dbCategoryId,
              description, price, vendor,
              JSON.stringify([picture]),
              available,
              specs,
            ],
          );

          if (result.rows[0]?.is_new) added++; else updated++;
        } catch (err: any) {
          console.error(`[SYNC] Error processing offer:`, err.message);
          skipped++;
        }
      });

      await Promise.all(promises);

      if ((i + BATCH_SIZE) % 200 === 0) {
        console.log(`[SYNC] Processed ${Math.min(i + BATCH_SIZE, offers.length)}/${offers.length}...`);
      }
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

    const result = { added, updated, removed: removed.rowCount || 0, skipped, total: offers.length };
    console.log(`[SYNC] Completed:`, result);
    return result;
  } catch (err: any) {
    console.error(`[SYNC] Failed:`, err.message);
    await pool.query(
      "UPDATE sync_log SET finished_at = NOW(), status = 'failed', error = $1 WHERE id = $2",
      [err.message, logId],
    );
    throw err;
  }
}

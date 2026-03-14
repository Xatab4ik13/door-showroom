import { pool } from '../db/pool.js';
import { parseStringPromise } from 'xml2js';

// Public YML feed — no auth required
const DVERCOM_YML_URL = process.env.DVERCOM_YML_URL || 'https://dver.com/xml/dver_yml.xml';

// Category mapping from dver.com IDs to our slugs
// Check dver.com YML <categories> for full list of IDs
const CATEGORY_MAP: Record<string, string> = {
  '1': 'mezhkomnatnye',
  '2': 'vhodnye',
  '3': 'furnitura',
  '4': 'peregorodki',
  '5': 'specialnye',
  '6': 'sistemy-otkryvaniya',
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
  sales_notes?: string[];
  country_of_origin?: string[];
  param?: any; // malformed nested structure from YML
}

/**
 * Recursively extract param name/value pairs from malformed nested <param> tags.
 * The YML feed has unclosed <param> tags, so xml2js nests them inside each other.
 */
function extractAllParams(node: any, result: Record<string, string> = {}): Record<string, string> {
  if (!node) return result;
  
  // Handle array of params
  if (Array.isArray(node)) {
    for (const item of node) {
      extractAllParams(item, result);
    }
    return result;
  }
  
  // Handle single param object with {$: {name: "..."}, _: "value", param: [...nested]}
  if (typeof node === 'object' && node.$ && node.$.name) {
    // The text value might be in _ or might be missing if child params consumed it
    const textValue = node._ || null;
    if (textValue) {
      result[node.$.name] = textValue.trim();
    }
    // Recurse into nested params
    if (node.param) {
      extractAllParams(node.param, result);
    }
  }
  
  return result;
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
          const sourceUrl = offer.url?.[0] || null; // kept for specs
          
          // Category
          const catId = offer.categoryId?.[0] || offer.categoryid?.[0];
          const catSlug = catId ? (CATEGORY_MAP[catId] || `dvercom-cat-${catId}`) : null;
          const dbCategoryId = catSlug ? (categorySlugToId[catSlug] || null) : null;

          // Extract ALL params from YML (handles malformed nested <param> tags)
          const specsObj: Record<string, string | null> = {};
          
          // 1. Extract nested <param> tags recursively
          const params = extractAllParams(offer.param);
          for (const [k, v] of Object.entries(params)) {
            specsObj[k] = v;
          }
          
          // 2. Extract standard YML fields into specs
          if (vendor) specsObj['производитель'] = vendor;
          if (model && !specsObj['модель']) specsObj['модель'] = model;
          if (vendorCode) specsObj['артикул'] = vendorCode;
          
          const country = (offer as any).country_of_origin?.[0] || null;
          if (country) specsObj['страна'] = country;
          
          const salesNotes = (offer as any).sales_notes?.[0] || null;
          if (salesNotes) specsObj['условия оплаты'] = salesNotes;
          
          // Keep source_url for internal use (stripped on API output)
          specsObj['source_url'] = sourceUrl;

          // Extract material and color from specs for dedicated columns
          const material = specsObj['Покрытие'] || specsObj['покрытие'] || specsObj['Материал'] || specsObj['материал'] || specsObj['Тип покрытия'] || null;
          const color = specsObj['Цвет'] || specsObj['цвет'] || specsObj['Оттенок'] || null;

          // Build slug: clean, unique, URL-friendly
          const slug = `dvercom-${vendorCode}`.toLowerCase().replace(/[^a-zа-яё0-9-]/gi, '-').replace(/-+/g, '-');
          const specs = JSON.stringify(specsObj);

          const result = await pool.query(
            `INSERT INTO products (supplier_id, source_sku, name, slug, category_id, description, price, manufacturer, material, color, images, in_stock, specs, sync_status, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', NOW())
             ON CONFLICT (supplier_id, source_sku) DO UPDATE SET
               name = EXCLUDED.name, price = EXCLUDED.price,
               category_id = COALESCE(EXCLUDED.category_id, products.category_id),
               description = EXCLUDED.description,
               manufacturer = EXCLUDED.manufacturer,
               material = COALESCE(EXCLUDED.material, products.material),
               color = COALESCE(EXCLUDED.color, products.color),
               images = EXCLUDED.images,
               in_stock = EXCLUDED.in_stock,
               specs = EXCLUDED.specs,
               sync_status = 'active', updated_at = NOW()
             RETURNING (xmax = 0) as is_new`,
            [
              supplierId, vendorCode, name, slug, dbCategoryId,
              description, price, vendor, material, color,
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

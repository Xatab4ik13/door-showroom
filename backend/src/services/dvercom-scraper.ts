import { pool } from '../db/pool.js';
import * as cheerio from 'cheerio';

const SCRAPE_DELAY_MS = 800; // delay between requests to not overload supplier
const BATCH_LOG_INTERVAL = 50;

interface ScrapedAccessory {
  name: string;
  article: string;
  price: number;
  description: string;
  default_qty: number;
}

interface ScrapedDetails {
  specs: Record<string, string>;
  sizes: string[];
  accessories: ScrapedAccessory[];
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scrape a single product page from dver.com and extract:
 * - Full specs table (Артикул, Цвет, Тип полотна, etc.)
 * - Available sizes
 * - Accessories with prices (Коробка, Наличник, Добор, etc.)
 */
async function scrapeProductPage(url: string): Promise<ScrapedDetails | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ru-RU,ru;q=0.9',
      },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Extract specs from the characteristics table
    const specs: Record<string, string> = {};
    // The specs table is typically in the "Характеристики" tab
    $('table').each((_i, table) => {
      $(table).find('tr').each((_j, row) => {
        const cells = $(row).find('td');
        if (cells.length === 2) {
          const label = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (label && value && label.length < 50 && value.length < 200) {
            specs[label] = value;
          }
        }
      });
    });

    // Also try div-based spec layouts
    $('.product-char-table tr, .product-detail-properties tr, .props_list tr, [class*="character"] tr').each((_i, row) => {
      const cells = $(row).find('td, th');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim();
        const value = $(cells[1]).text().trim();
        if (label && value && !specs[label]) {
          specs[label] = value;
        }
      }
    });

    // 2. Extract sizes
    const sizes: string[] = [];
    // Look for size buttons/links
    $('[class*="size"], [class*="razmer"], [data-size]').each((_i, el) => {
      const text = $(el).text().trim();
      // Match patterns like "200 x 70", "200x80", "190 х 60"
      if (/\d+\s*[xхX×]\s*\d+/.test(text)) {
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (!sizes.includes(normalized)) sizes.push(normalized);
      }
    });
    // Also scan all text for size patterns in common containers
    $('a, span, div, button').each((_i, el) => {
      const text = $(el).text().trim();
      if (/^\d{3}\s*[xхX×]\s*\d{2,4}$/.test(text)) {
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (!sizes.includes(normalized)) sizes.push(normalized);
      }
    });

    // 3. Extract accessories from the configurator sidebar
    const accessories: ScrapedAccessory[] = [];

    // Parse JSON cart data embedded in the page (most reliable)
    const pageText = html;
    const cartJsonRegex = /\{"cart":\s*\{"items":\s*\[([^\]]+)\]/g;
    let match;
    const seenArticles = new Set<string>();

    while ((match = cartJsonRegex.exec(pageText)) !== null) {
      try {
        const itemsStr = `[${match[1]}]`;
        const items = JSON.parse(itemsStr);
        for (const item of items) {
          if (item.articul && !seenArticles.has(item.articul)) {
            seenArticles.add(item.articul);
            accessories.push({
              name: item.name?.split(' F0')[0]?.split(' арт.')[0] || item.name || '',
              article: item.articul,
              price: parseFloat(item.price_rozn) || 0,
              description: item.name || '',
              default_qty: parseInt(item.quantity) || 0,
            });
          }
        }
      } catch { /* skip malformed JSON */ }
    }

    return { specs, sizes, accessories };
  } catch (err: any) {
    console.error(`[SCRAPER] Error fetching ${url}:`, err.message);
    return null;
  }
}

/**
 * Scrape all product pages from dver.com and enrich the database
 * with full specs, sizes, and accessories.
 */
export async function scrapeAllProducts(limit?: number) {
  console.log('[SCRAPER] Starting full product page scraping...');

  // Get all products that have a source_url in specs
  const query = limit
    ? `SELECT id, name, specs FROM products WHERE supplier_id = (SELECT id FROM suppliers WHERE slug = 'dvercom') AND sync_status = 'active' ORDER BY id LIMIT $1`
    : `SELECT id, name, specs FROM products WHERE supplier_id = (SELECT id FROM suppliers WHERE slug = 'dvercom') AND sync_status = 'active' ORDER BY id`;

  const result = await pool.query(query, limit ? [limit] : []);
  const products = result.rows;
  console.log(`[SCRAPER] Found ${products.length} products to scrape`);

  let scraped = 0, failed = 0, skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const specs = product.specs || {};
    const sourceUrl = specs.source_url;

    if (!sourceUrl) {
      skipped++;
      continue;
    }

    const details = await scrapeProductPage(sourceUrl);

    if (details) {
      // Merge scraped specs with existing (scraped take priority for richer data)
      const mergedSpecs = { ...specs };

      // Add all scraped specs
      for (const [key, val] of Object.entries(details.specs)) {
        if (val && key.length < 50) {
          mergedSpecs[key] = val;
        }
      }

      // Store sizes and accessories in specs JSON
      if (details.sizes.length > 0) {
        mergedSpecs['_sizes'] = JSON.stringify(details.sizes);
      }
      if (details.accessories.length > 0) {
        mergedSpecs['_accessories'] = JSON.stringify(details.accessories);
      }

      await pool.query(
        'UPDATE products SET specs = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(mergedSpecs), product.id],
      );
      scraped++;
    } else {
      failed++;
    }

    if ((i + 1) % BATCH_LOG_INTERVAL === 0) {
      console.log(`[SCRAPER] Progress: ${i + 1}/${products.length} (scraped: ${scraped}, failed: ${failed})`);
    }

    // Rate limiting
    await sleep(SCRAPE_DELAY_MS);
  }

  const summary = { total: products.length, scraped, failed, skipped };
  console.log('[SCRAPER] Completed:', summary);
  return summary;
}

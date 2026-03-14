import type { ApiProduct } from '@/lib/api';
import type { CatalogProduct, Category, Tag } from '@/data/catalog';

/** Map API product to the shape used by ProductCard and other UI components */
export function apiProductToCard(p: ApiProduct): CatalogProduct {
  // Map dver.com category names to our category keys
  const categoryMap: Record<string, Category> = {
    mezhkomnatnye: 'mezhkomnatnye',
    vhodnye: 'vhodnye',
    furnitura: 'furnitura',
  };

  const supplierSlug = p.supplier_slug || '';
  const catName = p.category_name?.toLowerCase() || '';
  
  let category: Category = 'mezhkomnatnye'; // default
  if (catName.includes('входн')) category = 'vhodnye';
  else if (catName.includes('фурнитур')) category = 'furnitura';
  else if (catName.includes('перегород')) category = 'peregorodki';

  // Primary image
  const image = Array.isArray(p.images) && p.images.length > 0
    ? p.images[0]
    : `https://dver.com/xml/images/${p.source_sku}.jpeg`;

  // Tags based on price/availability/recency
  const tags: Tag[] = [];
  if (p.old_price && p.old_price > Number(p.price)) tags.push('sale');
  // Mark products created in last 30 days as "new"
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (p.created_at && new Date(p.created_at).getTime() > thirtyDaysAgo) tags.push('new');

  return {
    id: p.slug, // use slug as ID for routing
    name: p.name,
    category,
    subcategory: p.specs?.group?.toLowerCase().replace(/\s+/g, '-') || undefined,
    tags,
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image,
    material: p.material || undefined,
    finish: p.color || undefined,
    manufacturer: p.manufacturer || p.specs?.['Бренд'] || undefined,
    colors: ['#D0CCC6'], // default swatch
  };
}

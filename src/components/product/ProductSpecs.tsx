import type { CatalogProduct } from '@/data/catalog';

interface ProductSpecsProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

// Internal/technical fields to hide from customers
const hiddenKeys = new Set([
  'source_url', 'supplier_url', 'xml_url', 'import_url', 'sync_id',
  'url', 'id', 'slug', 'group', 'source_sku',
  'условия оплаты',
  '_sizes', '_accessories', // internal structured data
]);

// Nice display names for known Russian param keys
const labelMap: Record<string, string> = {
  'артикул': 'Артикул',
  'модель': 'Модель',
  'цвет': 'Цвет',
  'коллекция': 'Коллекция',
  'тип полотна': 'Тип полотна',
  'тип покрытия': 'Тип покрытия',
  'толщина': 'Толщина',
  'стиль': 'Стиль',
  'упаковка': 'Упаковка',
  'вид номенклатуры': 'Вид номенклатуры',
  'серия': 'Серия',
  'размер': 'Размер',
  'группа товаров': 'Группа товаров',
  'группа': 'Группа',
  'материал': 'Материал',
  'покрытие': 'Покрытие',
  'производитель': 'Производитель',
  'страна': 'Страна',
  'вес': 'Вес',
  'гарантия': 'Гарантия',
  'collection': 'Коллекция',
  'model': 'Модель',
};

// Priority order for known keys (lower = shown first)
const keyOrder: Record<string, number> = {
  'артикул': 1,
  'производитель': 2,
  'модель': 3,
  'коллекция': 4,
  'цвет': 5,
  'тип полотна': 6,
  'тип покрытия': 7,
  'толщина': 8,
  'стиль': 9,
  'группа': 10,
  'вид номенклатуры': 11,
  'упаковка': 12,
  'страна': 13,
};

const ProductSpecs = ({ product, apiSpecs }: ProductSpecsProps) => {
  const specRows: { label: string; value: string; order: number }[] = [];

  if (apiSpecs && Object.keys(apiSpecs).length > 0) {
    for (const [key, val] of Object.entries(apiSpecs)) {
      if (!val || hiddenKeys.has(key) || hiddenKeys.has(key.toLowerCase())) continue;
      if (key.startsWith('_')) continue; // skip internal prefixed keys
      const label = labelMap[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      const order = keyOrder[key.toLowerCase()] || 50;
      specRows.push({ label, value: val, order });
    }

    // Add base fields if not already in specs
    const specLabels = new Set(specRows.map(r => r.label.toLowerCase()));

    if (product.manufacturer && product.manufacturer !== 'Не указан' && !specLabels.has('производитель')) {
      specRows.push({ label: 'Производитель', value: product.manufacturer, order: 2 });
    }
    if (product.material && product.material !== 'Не указан' && !specLabels.has('материал')) {
      specRows.push({ label: 'Материал', value: product.material, order: 15 });
    }
    if (product.finish && product.finish !== 'Не указан' && !specLabels.has('покрытие') && !specLabels.has('цвет')) {
      specRows.push({ label: 'Покрытие', value: product.finish, order: 16 });
    }
  } else {
    if (product.manufacturer && product.manufacturer !== 'Не указан') {
      specRows.push({ label: 'Производитель', value: product.manufacturer, order: 2 });
    }
    if (product.material && product.material !== 'Не указан') {
      specRows.push({ label: 'Материал', value: product.material, order: 15 });
    }
    if (product.finish && product.finish !== 'Не указан') {
      specRows.push({ label: 'Покрытие', value: product.finish, order: 16 });
    }
  }

  if (specRows.length === 0) return null;

  // Sort by priority order
  specRows.sort((a, b) => a.order - b.order);

  return (
    <div>
      <h3
        className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        Характеристики
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {specRows.map((spec, i) => (
            <tr key={spec.label} className={i % 2 === 0 ? 'bg-secondary/50' : ''}>
              <td className="py-2.5 px-3 text-muted-foreground font-medium w-1/2">{spec.label}</td>
              <td className="py-2.5 px-3 text-foreground">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSpecs;

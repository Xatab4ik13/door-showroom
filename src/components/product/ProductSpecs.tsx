import type { CatalogProduct } from '@/data/catalog';

interface ProductSpecsProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

// Internal/technical fields to hide from customers
const hiddenKeys = new Set([
  'source_url', 'supplier_url', 'xml_url', 'import_url', 'sync_id',
  'url', 'id', 'slug', 'source_sku',
  'условия оплаты',
  '_sizes', '_accessories',
  // Useless technical fields
  'вид номенклатуры', 'группа', 'group', 'упаковка',
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
  'серия': 'Серия',
  'размер': 'Размер',
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
  'материал': 9,
  'стиль': 10,
  'страна': 11,
};

const ProductSpecs = ({ product, apiSpecs }: ProductSpecsProps) => {
  const specRows: { label: string; value: string; order: number }[] = [];
  // Track seen labels (lowercase) to prevent duplicates
  const seenLabels = new Set<string>();

  const addRow = (label: string, value: string, order: number) => {
    const key = label.toLowerCase();
    if (seenLabels.has(key)) return;
    seenLabels.add(key);
    specRows.push({ label, value, order });
  };

  if (apiSpecs && Object.keys(apiSpecs).length > 0) {
    for (const [key, val] of Object.entries(apiSpecs)) {
      if (!val || hiddenKeys.has(key.toLowerCase())) continue;
      if (key.startsWith('_')) continue;
      const lowerKey = key.toLowerCase();
      const label = labelMap[lowerKey] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      const order = keyOrder[lowerKey] || 50;
      addRow(label, val, order);
    }

    // Add base fields if not already present
    if (product.manufacturer && product.manufacturer !== 'Не указан') {
      addRow('Производитель', product.manufacturer, 2);
    }
    if (product.material && product.material !== 'Не указан') {
      addRow('Материал', product.material, 9);
    }
    if (product.finish && product.finish !== 'Не указан') {
      addRow('Покрытие', product.finish, 16);
    }
  } else {
    if (product.manufacturer && product.manufacturer !== 'Не указан') {
      addRow('Производитель', product.manufacturer, 2);
    }
    if (product.material && product.material !== 'Не указан') {
      addRow('Материал', product.material, 9);
    }
    if (product.finish && product.finish !== 'Не указан') {
      addRow('Покрытие', product.finish, 16);
    }
  }

  if (specRows.length === 0) return null;

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

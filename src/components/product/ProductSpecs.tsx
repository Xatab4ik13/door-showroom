import type { CatalogProduct } from '@/data/catalog';

interface ProductSpecsProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

const defaultSpecs = (p: CatalogProduct) => [
  { label: 'Материал', value: p.material },
  { label: 'Покрытие', value: p.finish },
  { label: 'Производитель', value: p.manufacturer },
];

const ProductSpecs = ({ product, apiSpecs }: ProductSpecsProps) => {
  // Build specs: use API specs if available, otherwise defaults
  const specRows: { label: string; value: string }[] = [];

  if (apiSpecs && Object.keys(apiSpecs).length > 0) {
    // Always show basic info first
    if (product.manufacturer && product.manufacturer !== 'Не указан') {
      specRows.push({ label: 'Производитель', value: product.manufacturer });
    }
    if (product.material && product.material !== 'Не указан') {
      specRows.push({ label: 'Материал', value: product.material });
    }
    if (product.finish && product.finish !== 'Не указан') {
      specRows.push({ label: 'Покрытие', value: product.finish });
    }
    // Add all API specs (hide internal fields)
    const hiddenKeys = new Set(['group', 'source_url', 'source_sku', 'supplier_url', 'xml_url', 'import_url', 'sync_id']);
    for (const [key, val] of Object.entries(apiSpecs)) {
      if (val && !hiddenKeys.has(key)) {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        specRows.push({ label, value: val });
      }
    }
  } else {
    specRows.push(...defaultSpecs(product));
    specRows.push(
      { label: 'Доступные размеры', value: '600×2000, 700×2000, 800×2000, 900×2000 мм' },
      { label: 'Толщина полотна', value: '36 мм' },
      { label: 'Гарантия', value: '5 лет' },
    );
  }

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

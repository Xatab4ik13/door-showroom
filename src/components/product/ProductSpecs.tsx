import type { CatalogProduct } from '@/data/catalog';

interface ProductSpecsProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

// Internal/technical fields to hide from customers
const hiddenKeys = new Set([
  'group', 'source_url', 'source_sku', 'supplier_url', 'xml_url',
  'import_url', 'sync_id', 'url', 'sku', 'id', 'slug',
]);

const ProductSpecs = ({ product, apiSpecs }: ProductSpecsProps) => {
  const specRows: { label: string; value: string }[] = [];

  if (apiSpecs && Object.keys(apiSpecs).length > 0) {
    // Show ALL specs from the supplier (except hidden internal fields)
    for (const [key, val] of Object.entries(apiSpecs)) {
      if (!val || hiddenKeys.has(key.toLowerCase())) continue;
      // Capitalize first letter, replace underscores
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
      specRows.push({ label, value: val });
    }

    // Add base fields if not already in specs
    const specLabels = new Set(specRows.map(r => r.label.toLowerCase()));

    if (product.manufacturer && product.manufacturer !== 'Не указан' && !specLabels.has('производитель')) {
      specRows.unshift({ label: 'Производитель', value: product.manufacturer });
    }
    if (product.material && product.material !== 'Не указан' && !specLabels.has('материал')) {
      specRows.unshift({ label: 'Материал', value: product.material });
    }
    if (product.finish && product.finish !== 'Не указан' && !specLabels.has('покрытие') && !specLabels.has('цвет')) {
      specRows.unshift({ label: 'Покрытие', value: product.finish });
    }
  } else {
    // Fallback for mock data
    if (product.manufacturer && product.manufacturer !== 'Не указан') {
      specRows.push({ label: 'Производитель', value: product.manufacturer });
    }
    if (product.material && product.material !== 'Не указан') {
      specRows.push({ label: 'Материал', value: product.material });
    }
    if (product.finish && product.finish !== 'Не указан') {
      specRows.push({ label: 'Покрытие', value: product.finish });
    }
  }

  if (specRows.length === 0) return null;

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

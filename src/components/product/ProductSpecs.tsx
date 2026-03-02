import type { CatalogProduct } from '@/data/catalog';

interface ProductSpecsProps {
  product: CatalogProduct;
}

const specs = (p: CatalogProduct) => [
  { label: 'Материал', value: p.material },
  { label: 'Покрытие', value: p.finish },
  { label: 'Производитель', value: p.manufacturer },
  { label: 'Доступные размеры', value: '600×2000, 700×2000, 800×2000, 900×2000 мм' },
  { label: 'Толщина полотна', value: '36 мм' },
  { label: 'Толщина коробки', value: '75 мм' },
  { label: 'Вес', value: '18–24 кг' },
  { label: 'Гарантия', value: '5 лет' },
];

const ProductSpecs = ({ product }: ProductSpecsProps) => {
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
          {specs(product).map((spec, i) => (
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

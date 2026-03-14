import { useState, useMemo, useEffect } from 'react';
import { Filter, X, Loader2 } from 'lucide-react';
import CatalogSidebar from '@/components/catalog/CatalogSidebar';
import ProductCard from '@/components/catalog/ProductCard';
import { catalogProducts as mockProducts, categories, type Category, type Tag } from '@/data/catalog';
import { useProducts } from '@/hooks/useProducts';
import { apiProductToCard } from '@/lib/productAdapter';

const Catalog = () => {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [tag, setTag] = useState<Tag | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Fetch from API
  const { products: apiProducts, total, loading, error, isApi } = useProducts({
    search: search || undefined,
    page,
    limit: 100,
  });

  // Convert API products to card format, or use mock data as fallback
  const allProducts = useMemo(() => {
    if (isApi && apiProducts.length > 0) {
      return apiProducts.map(apiProductToCard);
    }
    return mockProducts;
  }, [apiProducts, isApi]);

  const MAX_PRICE = useMemo(
    () => Math.max(...allProducts.map((p) => p.oldPrice ?? p.price), 200000),
    [allProducts],
  );

  // Collect all child keys for a subcategory that has children
  const activeSubKeys = useMemo(() => {
    if (!subcategory) return null;
    const catDef = categories.find(c => c.key === category);
    if (!catDef?.subcategories) return null;
    const subDef = catDef.subcategories.find(s => s.key === subcategory);
    if (subDef?.children) {
      return subDef.children.map(c => c.key);
    }
    return null;
  }, [category, subcategory]);

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (subcategory) {
        if (activeSubKeys) {
          if (!activeSubKeys.includes(p.subcategory ?? '')) return false;
        } else {
          if (p.subcategory !== subcategory) return false;
        }
      }
      if (tag !== 'all' && !p.tags.includes(tag)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedMaterials.length && !selectedMaterials.includes(p.material)) return false;
      if (selectedFinishes.length && !selectedFinishes.includes(p.finish)) return false;
      if (selectedManufacturers.length && !selectedManufacturers.includes(p.manufacturer)) return false;
      return true;
    });
  }, [allProducts, category, subcategory, activeSubKeys, tag, priceRange, selectedMaterials, selectedFinishes, selectedManufacturers]);

  // Build title
  const pageTitle = useMemo(() => {
    if (category === 'all') return 'Каталог';
    const catDef = categories.find(c => c.key === category);
    if (!catDef) return 'Каталог';
    if (subcategory && catDef.subcategories) {
      const subDef = catDef.subcategories.find(s => s.key === subcategory);
      if (subDef) {
        if (!subDef.children) {
          for (const s of catDef.subcategories) {
            const child = s.children?.find(c => c.key === subcategory);
            if (child) return `${catDef.label} — ${s.label} — ${child.label}`;
          }
        }
        return `${catDef.label} — ${subDef.label}`;
      }
      for (const s of catDef.subcategories) {
        const child = s.children?.find(c => c.key === subcategory);
        if (child) return `${catDef.label} — ${s.label} — ${child.label}`;
      }
    }
    return catDef.label;
  }, [category, subcategory]);

  const sidebarProps = {
    selectedCategory: category, onCategoryChange: setCategory,
    selectedSubcategory: subcategory, onSubcategoryChange: setSubcategory,
    selectedTag: tag, onTagChange: setTag,
    priceRange, onPriceRangeChange: setPriceRange,
    selectedMaterials, onMaterialsChange: setSelectedMaterials,
    selectedFinishes, onFinishesChange: setSelectedFinishes,
    selectedManufacturers, onManufacturersChange: setSelectedManufacturers,
    maxPrice: MAX_PRICE,
  };

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      {/* Page title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {pageTitle}
          </h1>
          {isApi && (
            <p className="text-xs text-muted-foreground mt-1">
              Данные обновлены с dver.com · {total} товаров
            </p>
          )}
        </div>
        <button
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
          onClick={() => setMobileFilters(true)}
        >
          <Filter className="w-4 h-4" />
          Фильтры
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <CatalogSidebar {...sidebarProps} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto p-6 lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold uppercase"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Фильтры
              </h2>
              <button onClick={() => setMobileFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <CatalogSidebar {...sidebarProps} />
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-md font-medium"
            >
              Показать {filtered.length} товаров
            </button>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {loading ? 'Загрузка...' : `Найдено: ${filtered.length} товаров`}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">Ничего не найдено</p>
              <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;

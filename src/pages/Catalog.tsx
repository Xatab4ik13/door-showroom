import { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogSidebar from '@/components/catalog/CatalogSidebar';
import ProductCard from '@/components/catalog/ProductCard';
import { catalogProducts, categories, type Category, type Tag } from '@/data/catalog';

const MAX_PRICE = Math.max(...catalogProducts.map((p) => p.oldPrice ?? p.price));

const Catalog = () => {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [tag, setTag] = useState<Tag | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);

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
    return catalogProducts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (subcategory) {
        if (activeSubKeys) {
          // Parent sub selected — match any child
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
  }, [category, subcategory, activeSubKeys, tag, priceRange, selectedMaterials, selectedFinishes, selectedManufacturers]);

  // Build title
  const pageTitle = useMemo(() => {
    if (category === 'all') return 'Каталог';
    const catDef = categories.find(c => c.key === category);
    if (!catDef) return 'Каталог';
    if (subcategory && catDef.subcategories) {
      const subDef = catDef.subcategories.find(s => s.key === subcategory);
      if (subDef) {
        // Check if it's a child-level selection
        if (!subDef.children) {
          // Could be a child key — search children
          for (const s of catDef.subcategories) {
            const child = s.children?.find(c => c.key === subcategory);
            if (child) return `${catDef.label} — ${s.label} — ${child.label}`;
          }
        }
        return `${catDef.label} — ${subDef.label}`;
      }
      // Check if subcategory is a child key
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Page title */}
        <div className="mb-8 flex items-center justify-between">
          <h1
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {pageTitle}
          </h1>
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
              Найдено: {filtered.length} товаров
            </p>
            {filtered.length > 0 ? (
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
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import CatalogSidebar from '@/components/catalog/CatalogSidebar';
import ProductCard from '@/components/catalog/ProductCard';
import { catalogProducts as mockProducts, categories, type Category, type Tag } from '@/data/catalog';
import { useProducts } from '@/hooks/useProducts';
import { useFacets } from '@/hooks/useFacets';
import { apiProductToCard } from '@/lib/productAdapter';
import PageSEO from '@/components/PageSEO';

const ITEMS_PER_PAGE = 24;

// Map frontend category keys to backend category slugs
const categorySlugMap: Record<string, string> = {
  mezhkomnatnye: 'mezhkomnatnye',
  vhodnye: 'vhodnye',
  furnitura: 'furnitura',
  peregorodki: 'peregorodki',
  'sistemy-otkryvaniya': 'sistemy-otkryvaniya',
  specialnye: 'specialnye',
};

const validCategories = new Set<string>(['mezhkomnatnye', 'vhodnye', 'furnitura', 'peregorodki', 'sistemy-otkryvaniya', 'specialnye']);

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const urlCategory = searchParams.get('category') || 'all';
  const urlSubcategory = searchParams.get('sub') || null;

  const [category, setCategory] = useState<Category | 'all'>(
    validCategories.has(urlCategory) ? urlCategory as Category : 'all'
  );
  const [subcategory, setSubcategory] = useState<string | null>(urlSubcategory);
  const [tag, setTag] = useState<Tag | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'updated_at' | 'price' | 'name'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sync URL params when category/subcategory change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (category !== 'all') params.category = category;
    if (subcategory) params.sub = subcategory;
    setSearchParams(params, { replace: true });
  }, [category, subcategory, setSearchParams]);

  // Sync state when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlCat = searchParams.get('category') || 'all';
    const urlSub = searchParams.get('sub') || null;
    if (validCategories.has(urlCat) && urlCat !== category) {
      setCategory(urlCat as Category);
    } else if (urlCat === 'all' && category !== 'all') {
      setCategory('all');
    }
    if (urlSub !== subcategory) {
      setSubcategory(urlSub);
    }
  }, [searchParams]);

  // Fetch facets for dynamic filter options
  const { facets } = useFacets();

  // Build API params
  const apiCategory = category !== 'all' ? categorySlugMap[category] : undefined;

  // Build search query: combine user search with subcategory label for API filtering
  const buildSearch = () => {
    const parts: string[] = [];
    if (search) parts.push(search);
    if (subcategory) {
      // Find subcategory label to use as search term
      const catDef = categories.find(c => c.key === category);
      if (catDef?.subcategories) {
        for (const sub of catDef.subcategories) {
          if (sub.key === subcategory) { parts.push(sub.label); break; }
          const child = sub.children?.find(c => c.key === subcategory);
          if (child) { parts.push(child.label); break; }
        }
      }
    }
    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  const { products: apiProducts, total, loading, error, isApi } = useProducts({
    search: buildSearch(),
    category: apiCategory,
    page,
    limit: ITEMS_PER_PAGE,
    price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
    price_max: priceRange[1] > 0 ? priceRange[1] : undefined,
    manufacturer: selectedManufacturers.length > 0 ? selectedManufacturers.join(',') : undefined,
    material: selectedMaterials.length > 0 ? selectedMaterials.join(',') : undefined,
    color: selectedFinishes.length > 0 ? selectedFinishes.join(',') : undefined,
    sort,
    order: sortOrder,
  });

  // Convert API products to card format, or use mock data as fallback
  const products = useMemo(() => {
    if (isApi && apiProducts.length > 0) {
      return apiProducts.map(apiProductToCard);
    }
    if (isApi && apiProducts.length === 0 && !loading) {
      return []; // API returned empty — don't show mocks
    }
    return mockProducts;
  }, [apiProducts, isApi, loading]);

  const totalProducts = isApi ? total : products.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // For mock data, do client-side pagination
  const displayProducts = useMemo(() => {
    if (isApi) return products;
    const start = (page - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, isApi, page]);

  // Dynamic filter values from facets or fallback
  const dynamicManufacturers = facets?.manufacturers ?? [];
  const dynamicMaterials = facets?.materials ?? [];
  const dynamicColors = facets?.colors ?? [];

  // Reset page when filters change
  const handleCategoryChange = useCallback((cat: Category | 'all') => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handleSubcategoryChange = useCallback((sub: string | null) => {
    setSubcategory(sub);
    setPage(1);
  }, []);

  const handleTagChange = useCallback((t: Tag | 'all') => {
    setTag(t);
    setPage(1);
  }, []);

  const handlePriceChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
    setPage(1);
  }, []);

  const handleManufacturersChange = useCallback((m: string[]) => {
    setSelectedManufacturers(m);
    setPage(1);
  }, []);

  const handleMaterialsChange = useCallback((m: string[]) => {
    setSelectedMaterials(m);
    setPage(1);
  }, []);

  const handleFinishesChange = useCallback((f: string[]) => {
    setSelectedFinishes(f);
    setPage(1);
  }, []);

  // Build title
  const pageTitle = useMemo(() => {
    if (category === 'all') return 'Каталог';
    const catDef = categories.find(c => c.key === category);
    if (!catDef) return 'Каталог';
    if (subcategory && catDef.subcategories) {
      const subDef = catDef.subcategories.find(s => s.key === subcategory);
      if (subDef) return `${catDef.label} — ${subDef.label}`;
      for (const s of catDef.subcategories) {
        const child = s.children?.find(c => c.key === subcategory);
        if (child) return `${catDef.label} — ${s.label} — ${child.label}`;
      }
    }
    return catDef.label;
  }, [category, subcategory]);

  const sidebarProps = {
    selectedCategory: category, onCategoryChange: handleCategoryChange,
    selectedSubcategory: subcategory, onSubcategoryChange: handleSubcategoryChange,
    selectedTag: tag, onTagChange: handleTagChange,
    priceRange, onPriceRangeChange: handlePriceChange,
    selectedMaterials, onMaterialsChange: handleMaterialsChange,
    selectedFinishes, onFinishesChange: handleFinishesChange,
    selectedManufacturers, onManufacturersChange: handleManufacturersChange,
    maxPrice: 200000,
    dynamicManufacturers,
    dynamicMaterials,
    dynamicColors,
  };

  // Pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-10">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[40px] h-10 rounded-md text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-muted-foreground'
              }`}
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const categoryTitles: Record<string, string> = {
    all: 'Каталог дверей в Москве',
    mezhkomnatnye: 'Межкомнатные двери в Москве',
    vhodnye: 'Входные двери в Москве',
    furnitura: 'Фурнитура для дверей',
    peregorodki: 'Перегородки',
    specialnye: 'Специальные двери',
  };

  const seoTitle = `${categoryTitles[category] || 'Каталог дверей'} — купить с доставкой | RUSDOORS`;
  const seoDesc = category === 'all'
    ? 'Каталог входных и межкомнатных дверей RUSDOORS. Более 3000 моделей от ведущих производителей. Доставка и установка по Москве и МО. Цены от 3 000 ₽.'
    : `${categoryTitles[category] || 'Двери'} — купить в интернет-магазине RUSDOORS с доставкой по Москве. Широкий выбор, выгодные цены, бесплатный замер.`;

  return (
    <>
    <PageSEO title={seoTitle} description={seoDesc} canonical={`https://rusdoors.su/catalog${category !== 'all' ? `?category=${category}` : ''}`} />
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
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={`${sort}-${sortOrder}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split('-') as [typeof sort, typeof sortOrder];
              setSort(s);
              setSortOrder(o);
              setPage(1);
            }}
            className="hidden md:block text-sm px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="updated_at-desc">По новизне</option>
            <option value="price-asc">Цена ↑</option>
            <option value="price-desc">Цена ↓</option>
            <option value="name-asc">По названию</option>
          </select>
          <button
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
            onClick={() => setMobileFilters(true)}
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>
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
              Показать товары
            </button>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {loading ? 'Загрузка...' : `Найдено: ${totalProducts} товаров`}
            {totalPages > 1 && !loading && ` · Страница ${page} из ${totalPages}`}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {renderPagination()}
            </>
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

import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, tagFilters, manufacturers, materials, finishes, type Category, type Tag } from '@/data/catalog';

interface CatalogSidebarProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (cat: Category | 'all') => void;
  selectedSubcategory: string | null;
  onSubcategoryChange: (sub: string | null) => void;
  selectedTag: Tag | 'all';
  onTagChange: (tag: Tag | 'all') => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedMaterials: string[];
  onMaterialsChange: (mats: string[]) => void;
  selectedFinishes: string[];
  onFinishesChange: (fins: string[]) => void;
  selectedManufacturers: string[];
  onManufacturersChange: (mans: string[]) => void;
  maxPrice: number;
}

const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold uppercase tracking-wider text-foreground"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

const CheckboxItem = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2 cursor-pointer py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-border accent-[hsl(205,85%,45%)]"
    />
    {label}
  </label>
);

const CatalogSidebar = ({
  selectedCategory, onCategoryChange,
  selectedSubcategory, onSubcategoryChange,
  selectedTag, onTagChange,
  priceRange, onPriceRangeChange,
  selectedMaterials, onMaterialsChange,
  selectedFinishes, onFinishesChange,
  selectedManufacturers, onManufacturersChange,
  maxPrice,
}: CatalogSidebarProps) => {

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSubExpand = (key: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCategoryClick = (key: Category | 'all') => {
    onCategoryChange(key);
    onSubcategoryChange(null);
    if (key !== 'all') {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    }
  };

  const handleSubcategoryClick = (catKey: Category | 'all', subKey: string) => {
    if (catKey !== 'all') {
      onCategoryChange(catKey);
    }
    onSubcategoryChange(subKey);
  };

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      {/* Categories */}
      <div className="mb-6">
        <h3
          className="text-lg font-bold uppercase tracking-wider text-foreground mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Категории
        </h3>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = expandedCategories.has(cat.key);

            return (
              <div key={cat.key}>
                {/* Category button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive && !selectedSubcategory
                        ? 'bg-[hsl(205,85%,45%)] text-white font-medium'
                        : isActive
                        ? 'bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)] font-medium'
                        : 'text-muted-foreground hover:text-[hsl(205,85%,45%)] hover:bg-accent'
                    }`}
                  >
                    {cat.label}
                  </button>
                  {hasSubs && (
                    <button
                      onClick={() => toggleExpand(cat.key)}
                      className="p-2 text-muted-foreground hover:text-[hsl(205,85%,45%)] transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                <AnimatePresence>
                  {hasSubs && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 border-l-2 border-border ml-4 mt-1 mb-2 space-y-0.5">
                        {cat.subcategories!.map((sub) => {
                          const isSubActive = selectedSubcategory === sub.key;
                          const hasChildren = sub.children && sub.children.length > 0;
                          const isSubExpanded = expandedSubs.has(sub.key);

                          return (
                            <div key={sub.key}>
                              <div className="flex items-center">
                                <button
                                  onClick={() => handleSubcategoryClick(cat.key, sub.key)}
                                  className={`flex-1 text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                                    isSubActive
                                      ? 'text-[hsl(205,85%,45%)] font-medium bg-[hsl(205,85%,45%)]/10'
                                      : 'text-muted-foreground hover:text-[hsl(205,85%,45%)] hover:bg-accent'
                                  }`}
                                >
                                  {sub.label}
                                </button>
                                {hasChildren && (
                                  <button
                                    onClick={() => toggleSubExpand(sub.key)}
                                    className="p-1.5 text-muted-foreground hover:text-[hsl(205,85%,45%)] transition-colors"
                                  >
                                    <motion.div
                                      animate={{ rotate: isSubExpanded ? 90 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </motion.div>
                                  </button>
                                )}
                              </div>

                              {/* Third level children */}
                              <AnimatePresence>
                                {hasChildren && isSubExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-3 border-l border-border/50 ml-3 mt-0.5 mb-1 space-y-0.5">
                                      {sub.children!.map((child) => {
                                        const isChildActive = selectedSubcategory === child.key;
                                        return (
                                          <button
                                            key={child.key}
                                            onClick={() => handleSubcategoryClick(cat.key, child.key)}
                                            className={`block w-full text-left px-2.5 py-1 rounded text-xs transition-colors ${
                                              isChildActive
                                                ? 'text-[hsl(205,85%,45%)] font-medium bg-[hsl(205,85%,45%)]/10'
                                                : 'text-muted-foreground hover:text-[hsl(205,85%,45%)]'
                                            }`}
                                          >
                                            {child.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tagFilters.map((tag) => (
          <button
            key={tag.key}
            onClick={() => onTagChange(tag.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-colors ${
              selectedTag === tag.key
                ? 'bg-[hsl(205,85%,45%)] text-white'
                : 'bg-secondary text-secondary-foreground hover:text-[hsl(205,85%,45%)] hover:bg-accent'
            }`}
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <FilterSection title="Цена">
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={priceRange[0] || ''}
              onChange={(e) => onPriceRangeChange([Number(e.target.value.replace(/\D/g, '')), priceRange[1]])}
              className="w-full px-3 py-2 text-base font-bold border border-border rounded-md bg-background text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
              placeholder="от"
            />
            <span className="text-muted-foreground text-sm shrink-0">—</span>
            <input
              type="text"
              inputMode="numeric"
              value={priceRange[1] || ''}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value.replace(/\D/g, ''))])}
              className="w-full px-3 py-2 text-base font-bold border border-border rounded-md bg-background text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
              placeholder="до"
            />
          </div>
        </FilterSection>

        <FilterSection title="Материал" defaultOpen={false}>
          {materials.map((m) => (
            <CheckboxItem
              key={m}
              label={m}
              checked={selectedMaterials.includes(m)}
              onChange={() => toggleItem(selectedMaterials, m, onMaterialsChange)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Цвет / покрытие" defaultOpen={false}>
          {finishes.map((f) => (
            <CheckboxItem
              key={f}
              label={f}
              checked={selectedFinishes.includes(f)}
              onChange={() => toggleItem(selectedFinishes, f, onFinishesChange)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Производитель" defaultOpen={false}>
          {manufacturers.map((m) => (
            <CheckboxItem
              key={m}
              label={m}
              checked={selectedManufacturers.includes(m)}
              onChange={() => toggleItem(selectedManufacturers, m, onManufacturersChange)}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
};

export default CatalogSidebar;

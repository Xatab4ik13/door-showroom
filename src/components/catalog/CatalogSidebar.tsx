import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categories, tagFilters, manufacturers, materials, finishes, type Category, type Tag } from '@/data/catalog';

interface CatalogSidebarProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (cat: Category | 'all') => void;
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
      className="w-4 h-4 rounded border-border accent-primary"
    />
    {label}
  </label>
);

const CatalogSidebar = ({
  selectedCategory, onCategoryChange,
  selectedTag, onTagChange,
  priceRange, onPriceRangeChange,
  selectedMaterials, onMaterialsChange,
  selectedFinishes, onFinishesChange,
  selectedManufacturers, onManufacturersChange,
  maxPrice,
}: CatalogSidebarProps) => {

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
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-[hsl(205,85%,45%)] text-white font-medium'
                  : 'text-muted-foreground hover:text-[hsl(205,85%,45%)] hover:bg-accent'
              }`}
            >
              {cat.label}
            </button>
          ))}
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
              placeholder="от"
              min={0}
            />
            <span className="text-muted-foreground text-sm">—</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
              placeholder="до"
              max={maxPrice}
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

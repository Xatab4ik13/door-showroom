import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2, ExternalLink, Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  fetchProducts, fetchFacets, type ApiProduct, type Facets, type ProductFilters,
  createProduct, updateProduct, uploadImage, fetchCategories, type AdminCategory,
  fetchSuppliers, type AdminSupplier,
} from '@/lib/api';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';
const LIMIT = 20;

const formatPrice = (p: number | null) =>
  p ? p.toLocaleString('ru-RU') + ' ₽' : '—';

interface SpecPair { key: string; value: string }

interface EditForm {
  name: string;
  price: string;
  old_price: string;
  description: string;
  category_id: string;
  manufacturer: string;
  material: string;
  color: string;
  supplier_slug: string;
  images: string[];
  specs: SpecPair[];
}

const blankForm: EditForm = {
  name: '', price: '', old_price: '', description: '',
  category_id: '', manufacturer: '', material: '', color: '',
  supplier_slug: 'manual', images: [], specs: [],
};

// Internal keys never shown in the structured editor (preserved on save via backend merge)
const HIDDEN_SPEC_KEYS = new Set([
  '_sizes', '_accessories',
  'source_url', 'supplier_url', 'xml_url', 'import_url', 'sync_id',
]);

// Suggested spec keys for quick add
const SPEC_SUGGESTIONS = [
  'Артикул', 'Модель', 'Коллекция', 'Тип полотна', 'Тип покрытия',
  'Толщина', 'Стиль', 'Серия', 'Размер', 'Покрытие', 'Страна', 'Вес', 'Гарантия',
];

const specsObjToPairs = (specs: Record<string, string | null> | null | undefined): SpecPair[] => {
  if (!specs || typeof specs !== 'object') return [];
  return Object.entries(specs)
    .filter(([k, v]) => !HIDDEN_SPEC_KEYS.has(k) && !k.startsWith('_') && v != null && String(v).length > 0)
    .map(([k, v]) => ({ key: k, value: String(v) }));
};

const pairsToSpecsObj = (pairs: SpecPair[]): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const { key, value } of pairs) {
    const k = key.trim();
    const v = value.trim();
    if (!k || !v) continue;
    out[k] = v;
  }
  return out;
};

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState<Facets | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<'updated_at' | 'price' | 'name'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Edit/Create dialog
  const { token } = useAdminAuth();
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(blankForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [allCategories, setAllCategories] = useState<AdminCategory[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<AdminSupplier[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCategories().then(setAllCategories).catch(() => {}); }, []);
  useEffect(() => {
    if (token) fetchSuppliers(token).then(setAllSuppliers).catch(() => {});
  }, [token]);

  // Search debounce
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load facets once
  useEffect(() => {
    fetchFacets().then(setFacets).catch(() => {});
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductFilters = {
        page,
        limit: LIMIT,
        sort: sortField,
        order: sortOrder,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (supplierFilter !== 'all') params.supplier = supplierFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await fetchProducts(params);
      setProducts(res.products);
      setTotal(res.total);
    } catch {
      toast({ title: 'Ошибка загрузки товаров', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, supplierFilter, categoryFilter, sortField, sortOrder, toast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const totalPages = Math.ceil(total / LIMIT);

  // Open edit
  const openEdit = (p: ApiProduct) => {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      price: String(p.price || ''),
      old_price: String(p.old_price || ''),
      description: p.description || '',
      category_id: p.category_id ? String(p.category_id) : '',
      manufacturer: p.manufacturer || '',
      material: p.material || '',
      color: p.color || '',
      supplier_slug: p.supplier_slug || 'manual',
      images: Array.isArray(p.images) ? p.images : [],
      specs: specsObjToPairs(p.specs),
    });
  };

  const openCreate = () => { setEditForm(blankForm); setCreateOpen(true); };

  const closeDialog = () => { setEditProduct(null); setCreateOpen(false); setEditForm(blankForm); };

  const handleAddImage = async (file: File) => {
    if (!token) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(file, token);
      setEditForm(f => ({ ...f, images: [...f.images, url] }));
    } catch {
      toast({ title: 'Ошибка загрузки фото', variant: 'destructive' });
    } finally { setUploadingImg(false); }
  };
  const handleRemoveImage = (i: number) =>
    setEditForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  // Save (create or edit)
  const handleSave = async () => {
    if (!token) return;
    if (!editForm.name || !editForm.price) {
      toast({ title: 'Укажите название и цену', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: editForm.name,
        price: Number(editForm.price) || 0,
        old_price: editForm.old_price ? Number(editForm.old_price) : null,
        description: editForm.description || null,
        category_id: editForm.category_id ? Number(editForm.category_id) : null,
        manufacturer: editForm.manufacturer || null,
        material: editForm.material || null,
        color: editForm.color || null,
        images: editForm.images,
      };
      if (editProduct) {
        // On edit, switch supplier by id (PATCH endpoint accepts supplier_id)
        const targetSlug = editForm.supplier_slug || 'manual';
        if (targetSlug !== (editProduct.supplier_slug || 'manual')) {
          const sup = allSuppliers.find(s => s.slug === targetSlug);
          if (sup) payload.supplier_id = sup.id;
        }
        await updateProduct(editProduct.id, payload, token);
        toast({ title: 'Товар обновлён' });
      } else {
        // On create, backend looks up / auto-creates supplier by slug
        payload.supplier_slug = editForm.supplier_slug || 'manual';
        await createProduct(payload, token);
        toast({ title: 'Товар создан' });
      }
      closeDialog();
      loadProducts();
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Скрыть товар из каталога?')) return;
    try {
      const token = localStorage.getItem('rusdoors_admin_token');
      await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast({ title: 'Товар скрыт' });
      loadProducts();
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  // Supplier filter options (dynamic from DB + "all")
  const supplierOptions = [
    { value: 'all', label: 'Все поставщики' },
    ...allSuppliers.map(s => ({ value: s.slug, label: s.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl tracking-wider uppercase text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
          >
            Товары
          </h1>
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {loading ? '...' : `${total} товаров в каталоге`}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Добавить товар
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, артикулу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border focus-visible:ring-primary"
          />
        </div>

        <Select value={supplierFilter} onValueChange={(v) => { setSupplierFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supplierOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-56 bg-card border-border">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {facets?.categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name} ({c.count})</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={`${sortField}_${sortOrder}`} onValueChange={(v) => {
          const [f, o] = v.split('_') as [typeof sortField, typeof sortOrder];
          setSortField(f);
          setSortOrder(o);
          setPage(1);
        }}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at_desc">Новые сначала</SelectItem>
            <SelectItem value="updated_at_asc">Старые сначала</SelectItem>
            <SelectItem value="price_asc">Цена ↑</SelectItem>
            <SelectItem value="price_desc">Цена ↓</SelectItem>
            <SelectItem value="name_asc">По алфавиту А-Я</SelectItem>
            <SelectItem value="name_desc">По алфавиту Я-А</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Товары не найдены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <thead>
                  <tr className="border-b border-border text-left">
                    {['Фото', 'Название', 'Артикул', 'Категория', 'Цена', 'Поставщик', 'Действия'].map((h) => (
                      <th
                        key={h}
                        className="p-3 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="w-12 h-16 bg-secondary rounded overflow-hidden flex items-center justify-center">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-[250px]">
                        <p className="font-medium text-foreground text-xs leading-tight truncate">{p.name}</p>
                        {p.manufacturer && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{p.manufacturer}</p>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{p.source_sku || '—'}</td>
                      <td className="p-3">
                        {p.category_name && (
                          <span className="text-[10px] uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {p.category_name}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-foreground text-xs" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {formatPrice(p.price)}
                        </span>
                        {p.old_price && (
                          <span className="text-[10px] text-muted-foreground line-through ml-1">
                            {formatPrice(p.old_price)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{p.supplier_name || p.supplier_slug}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <a href={`/product/${p.slug}`} target="_blank" rel="noopener">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Показано {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} из {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={!!editProduct || createOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Oswald', sans-serif" }} className="uppercase tracking-wider">
              {editProduct ? 'Редактировать товар' : 'Новый товар'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Название *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Цена (₽) *</Label>
                <Input type="number" value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Старая цена (₽)</Label>
                <Input type="number" value={editForm.old_price}
                  onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Категория</Label>
                <Select value={editForm.category_id || 'none'} onValueChange={(v) => setEditForm({ ...editForm, category_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Без категории —</SelectItem>
                    {allCategories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Производитель</Label>
                <Input value={editForm.manufacturer}
                  onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Поставщик</Label>
              <Select value={editForm.supplier_slug || 'manual'} onValueChange={(v) => setEditForm({ ...editForm, supplier_slug: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Ручной (без поставщика)</SelectItem>
                  {allSuppliers.filter(s => s.slug !== 'manual').map(s => (
                    <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Материал</Label>
                <Input value={editForm.material}
                  onChange={(e) => setEditForm({ ...editForm, material: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Цвет</Label>
                <Input value={editForm.color}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Описание</Label>
              <Textarea value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="mt-1" rows={4} />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Фотографии (до 10)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editForm.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border border-border bg-secondary">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-black/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {editForm.images.length < 10 && (
                  <>
                    <input ref={fileRef} type="file" accept="image/*" hidden
                      onChange={(e) => e.target.files?.[0] && handleAddImage(e.target.files[0])} />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                      className="w-20 h-20 rounded border-2 border-dashed border-border hover:border-primary hover:text-primary text-xs text-muted-foreground flex flex-col items-center justify-center gap-1 disabled:opacity-50">
                      {uploadingImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Фото
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;

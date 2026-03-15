import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
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
import { fetchProducts, fetchFacets, type ApiProduct, type Facets, type ProductFilters } from '@/lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';
const LIMIT = 20;

const formatPrice = (p: number | null) =>
  p ? p.toLocaleString('ru-RU') + ' ₽' : '—';

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

  // Edit dialog
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', old_price: '', description: '' });
  const [saving, setSaving] = useState(false);

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
    });
  };

  // Save edit
  const handleSave = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('rusdoors_admin_token');
      const res = await fetch(`${API_BASE}/api/products/${editProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price) || null,
          old_price: Number(editForm.old_price) || null,
          description: editForm.description || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Товар обновлён' });
      setEditProduct(null);
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

  // Supplier labels
  const supplierOptions = [
    { value: 'all', label: 'Все поставщики' },
    { value: 'dvercom', label: 'Скамбио Порте' },
    { value: 'supplier2', label: 'Поставщик 2' },
    { value: 'supplier3', label: 'Поставщик 3' },
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

      {/* Edit dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Oswald', sans-serif" }} className="uppercase tracking-wider">
              Редактировать товар
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Название</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Цена (₽)</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Старая цена (₽)</Label>
                <Input
                  type="number"
                  value={editForm.old_price}
                  onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Описание</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Отмена</Button>
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

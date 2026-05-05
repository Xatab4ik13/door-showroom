import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { uploadImage } from '@/lib/api';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

const CATEGORIES = [
  { slug: 'mezhkomnatnye', label: 'Межкомнатные двери' },
  { slug: 'vhodnye', label: 'Входные двери' },
  { slug: 'peregorodki', label: 'Перегородки' },
  { slug: 'furnitura', label: 'Фурнитура' },
];

interface PanelColor { id: number; name: string; image_url: string | null; price_modifier: number; sort_order: number; }
interface Service { id: number; name: string; description: string | null; price: number; price_type: 'fixed' | 'per_door'; sort_order: number; }

const authHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const ColorsManager = ({ category }: { category: string }) => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<PanelColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', image_url: '', price_modifier: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/product-extras/admin/colors?category_slug=${category}`, {
      headers: authHeaders(token),
    });
    setItems(res.ok ? await res.json() : []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, [category]);

  const handleUpload = async (file: File) => {
    if (!token) return;
    try {
      const url = await uploadImage(file, token);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success('Загружено');
    } catch { toast.error('Ошибка загрузки'); }
  };

  const add = async () => {
    if (!form.name) return toast.error('Введите название');
    const res = await fetch(`${API_BASE}/api/product-extras/admin/colors`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ category_slug: category, ...form }),
    });
    if (res.ok) {
      setForm({ name: '', image_url: '', price_modifier: 0 });
      reload();
      toast.success('Добавлено');
    } else toast.error('Ошибка');
  };

  const remove = async (id: number) => {
    await fetch(`${API_BASE}/api/product-extras/admin/colors/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    reload();
  };

  return (
    <div className="space-y-3">
      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((c) => (
            <div key={c.id} className="border border-border rounded-md p-2 bg-background">
              <div className="aspect-square bg-secondary rounded mb-2 overflow-hidden flex items-center justify-center">
                {c.image_url ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Нет фото</span>}
              </div>
              <p className="text-sm font-medium truncate">{c.name}</p>
              {Number(c.price_modifier) !== 0 && <p className="text-xs text-primary">+{c.price_modifier} ₽</p>}
              <button onClick={() => remove(c.id)} className="mt-1 text-xs text-destructive hover:underline inline-flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-border rounded-md p-4 grid grid-cols-1 md:grid-cols-[120px_1fr_120px_auto] gap-3 items-end">
        <div>
          <div className="aspect-square bg-secondary rounded overflow-hidden flex items-center justify-center mb-1">
            {form.image_url ? <img src={form.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Превью</span>}
          </div>
          <input type="file" ref={fileRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="w-full text-xs px-2 py-1 rounded border border-border hover:bg-accent inline-flex items-center justify-center gap-1">
            <Upload className="w-3 h-3" /> Фото
          </button>
        </div>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Название цвета (Дуб, Венге...)" className="px-3 py-2 text-sm rounded border border-border bg-background" />
        <input type="number" value={form.price_modifier} onChange={(e) => setForm({ ...form, price_modifier: Number(e.target.value) })}
          placeholder="Надбавка ₽" className="px-3 py-2 text-sm rounded border border-border bg-background" />
        <button onClick={add} className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>
    </div>
  );
};

const ServicesManager = ({ category }: { category: string }) => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: 0, price_type: 'fixed' as 'fixed' | 'per_door' });

  const reload = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/product-extras/admin/services?category_slug=${category}`, { headers: authHeaders(token) });
    setItems(res.ok ? await res.json() : []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, [category]);

  const add = async () => {
    if (!form.name) return toast.error('Введите название');
    const res = await fetch(`${API_BASE}/api/product-extras/admin/services`, {
      method: 'POST', headers: authHeaders(token),
      body: JSON.stringify({ category_slug: category, ...form }),
    });
    if (res.ok) {
      setForm({ name: '', description: '', price: 0, price_type: 'fixed' });
      reload(); toast.success('Добавлено');
    } else toast.error('Ошибка');
  };

  const remove = async (id: number) => {
    await fetch(`${API_BASE}/api/product-extras/admin/services/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    reload();
  };

  return (
    <div className="space-y-3">
      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.id} className="flex items-center justify-between border border-border rounded p-3 bg-background">
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                <p className="text-xs text-primary mt-0.5">
                  {s.price} ₽ {s.price_type === 'per_door' ? '× кол-во полотен' : 'фиксированно'}
                </p>
              </div>
              <button onClick={() => remove(s.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Название (Монтаж, Демонтаж...)" className="px-3 py-2 text-sm rounded border border-border bg-background md:col-span-2" />
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Описание (опционально)" className="px-3 py-2 text-sm rounded border border-border bg-background md:col-span-2" />
        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          placeholder="Цена ₽" className="px-3 py-2 text-sm rounded border border-border bg-background" />
        <select value={form.price_type} onChange={(e) => setForm({ ...form, price_type: e.target.value as any })}
          className="px-3 py-2 text-sm rounded border border-border bg-background">
          <option value="fixed">Фиксированная цена</option>
          <option value="per_door">За каждое полотно</option>
        </select>
        <button onClick={add} className="md:col-span-2 px-4 py-2 text-sm rounded bg-primary text-primary-foreground inline-flex items-center justify-center gap-1">
          <Plus className="w-4 h-4" /> Добавить услугу
        </button>
      </div>
    </div>
  );
};

const ProductExtrasPage = () => {
  const [tab, setTab] = useState<'colors' | 'services'>('colors');
  const [category, setCategory] = useState('vhodnye');

  return (
    <div className="p-6 max-w-5xl space-y-5">
      <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
        Расширения товара
      </h1>
      <p className="text-sm text-muted-foreground">
        Цвета внутренней панели и доп. услуги привязываются к категории целиком — автоматически появляются на всех товарах. На карточке товара можно отдельно скрыть/добавить.
      </p>

      <div className="flex gap-2 border-b border-border">
        {(['colors', 'services'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === t ? 'border-primary text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`} style={{ fontFamily: "'Oswald', sans-serif" }}>
            {t === 'colors' ? 'Цвета панели' : 'Доп. услуги'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Категория:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm rounded border border-border bg-background">
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </div>

      {tab === 'colors' ? <ColorsManager category={category} /> : <ServicesManager category={category} />}
    </div>
  );
};

export default ProductExtrasPage;

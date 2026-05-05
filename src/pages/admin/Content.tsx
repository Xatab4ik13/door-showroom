import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { fetchContent, saveContent, uploadImage } from '@/lib/api';
import { Plus, Trash2, Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  category?: string;
}

const CATEGORIES = [
  { slug: '', label: '— Выбрать категорию —' },
  { slug: 'mezhkomnatnye', label: 'Межкомнатные двери' },
  { slug: 'vhodnye', label: 'Входные двери' },
  { slug: 'peregorodki', label: 'Перегородки' },
  { slug: 'furnitura', label: 'Фурнитура' },
];

const HeroSlidesEditor = () => {
  const { token } = useAdminAuth();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchContent<Slide[]>('hero_slides').then((d) => {
      setSlides(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const update = (i: number, patch: Partial<Slide>) =>
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const handleCategoryChange = (i: number, cat: string) => {
    update(i, { category: cat || undefined, href: cat ? `/catalog?category=${cat}` : '/catalog' });
  };

  const handleUpload = async (i: number, file: File) => {
    if (!token) return;
    try {
      const url = await uploadImage(file, token);
      update(i, { image: url });
      toast.success('Картинка загружена');
    } catch { toast.error('Ошибка загрузки'); }
  };

  const addSlide = () => setSlides((s) => [...s, { image: '', title: '', subtitle: '', cta: 'Смотреть каталог', href: '/catalog' }]);
  const removeSlide = (i: number) => setSlides((s) => s.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await saveContent('hero_slides', slides, token);
      toast.success('Слайды сохранены');
    } catch { toast.error('Ошибка сохранения'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Слайды главного баннера
        </h2>
        <div className="flex gap-2">
          <button onClick={addSlide} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border border-border hover:bg-accent">
            <Plus className="w-4 h-4" /> Добавить слайд
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {slides.length === 0 && <p className="text-sm text-muted-foreground">Нет слайдов. По умолчанию используются встроенные.</p>}
        {slides.map((s, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-4 p-4 border border-border rounded-md">
            <div>
              <div className="aspect-video bg-secondary rounded overflow-hidden flex items-center justify-center mb-2">
                {s.image
                  ? <img src={s.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xs text-muted-foreground">Нет фото</span>}
              </div>
              <input ref={(el) => { fileInputs.current[i] = el; }} type="file" accept="image/*" hidden
                onChange={(e) => e.target.files?.[0] && handleUpload(i, e.target.files[0])} />
              <button onClick={() => fileInputs.current[i]?.click()}
                className="w-full inline-flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded border border-border hover:bg-accent">
                <Upload className="w-3 h-3" /> Загрузить фото
              </button>
            </div>
            <div className="space-y-2">
              <input value={s.title} onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Заголовок" className="w-full px-3 py-2 text-sm rounded border border-border bg-background" />
              <input value={s.subtitle} onChange={(e) => update(i, { subtitle: e.target.value })}
                placeholder="Подзаголовок" className="w-full px-3 py-2 text-sm rounded border border-border bg-background" />
              <div className="grid grid-cols-2 gap-2">
                <input value={s.cta} onChange={(e) => update(i, { cta: e.target.value })}
                  placeholder="Текст кнопки" className="px-3 py-2 text-sm rounded border border-border bg-background" />
                <select value={s.category || ''} onChange={(e) => handleCategoryChange(i, e.target.value)}
                  className="px-3 py-2 text-sm rounded border border-border bg-background">
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">Ссылка: <code>{s.href}</code></p>
            </div>
            <button onClick={() => removeSlide(i)} className="self-start p-2 text-destructive hover:bg-destructive/10 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const PopularProductsEditor = () => {
  const { token } = useAdminAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent<{ slugs: string[] }>('popular_products').then((d) => {
      setText((d?.slugs || []).join('\n'));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    const slugs = text.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      await saveContent('popular_products', { slugs }, token);
      toast.success('Список сохранён');
    } catch { toast.error('Ошибка'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Популярные товары на главной
        </h2>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Введите slug товаров (по одному в строке). Slug — это часть URL после <code>/product/</code>. Если пусто — подбираются автоматически.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
        placeholder="dvercom-f0000095971&#10;dvercom-f0000095814"
        className="w-full px-3 py-2 text-sm font-mono rounded border border-border bg-background" />
    </section>
  );
};

const ContentPage = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
        Контент сайта
      </h1>
      <HeroSlidesEditor />
      <PopularProductsEditor />
    </div>
  );
};

export default ContentPage;

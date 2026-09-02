import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { fetchContent, saveContent, uploadImage } from '@/lib/api';
import { Plus, Trash2, Upload, Save, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Block {
  title: string;
  text: string;
  images: string[];
}
interface PageData {
  title: string;
  subtitle: string;
  blocks: Block[];
}

const PAGES: { key: string; label: string; defaults: PageData }[] = [
  {
    key: 'page_advantages',
    label: 'Главная — Преимущества',
    defaults: { title: 'Преимущества', subtitle: 'Несколько причин почему стоит выбрать нас', blocks: [] },
  },
  {
    key: 'page_delivery',
    label: 'Доставка и оплата',
    defaults: { title: 'Доставка и оплата', subtitle: 'Двери, которые приходят вовремя', blocks: [] },
  },
  {
    key: 'page_works',
    label: 'Наши двери и работы (фото монтажей)',
    defaults: { title: 'Наши двери и работы', subtitle: 'Фото с наших объектов и монтажей', blocks: [] },
  },
  {
    key: 'page_installation',
    label: 'Замер и монтаж',
    defaults: { title: 'Замер и монтаж', subtitle: 'Профессиональная установка дверей под ключ', blocks: [] },
  },
];

const empty = (): PageData => ({ title: '', subtitle: '', blocks: [] });

const PageEditor = ({ k, label, defaults }: { k: string; label: string; defaults: PageData }) => {
  const { token } = useAdminAuth();
  const [data, setData] = useState<PageData>(empty());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchContent<PageData>(k).then((d) => {
      setData(d && typeof d === 'object' ? { ...defaults, ...d, blocks: d.blocks || [] } : defaults);
      setLoading(false);
    });
  }, [k]);

  const updateBlock = (i: number, patch: Partial<Block>) =>
    setData((d) => ({ ...d, blocks: d.blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));

  const addBlock = () =>
    setData((d) => ({ ...d, blocks: [...d.blocks, { title: '', text: '', images: [] }] }));

  const removeBlock = (i: number) =>
    setData((d) => ({ ...d, blocks: d.blocks.filter((_, idx) => idx !== i) }));

  const addImage = async (i: number, file: File) => {
    if (!token) return;
    try {
      const url = await uploadImage(file, token);
      updateBlock(i, { images: [...(data.blocks[i].images || []), url] });
      toast.success('Картинка загружена');
    } catch { toast.error('Ошибка загрузки'); }
  };

  const removeImage = (i: number, imgIdx: number) =>
    updateBlock(i, { images: data.blocks[i].images.filter((_, idx) => idx !== imgIdx) });

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await saveContent(k, data, token);
      toast.success('Сохранено');
    } catch { toast.error('Ошибка сохранения'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
          {label}
        </h2>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Заголовок страницы" className="px-3 py-2 text-sm rounded border border-border bg-background" />
        <input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          placeholder="Подзаголовок" className="px-3 py-2 text-sm rounded border border-border bg-background" />
      </div>

      <div className="space-y-3">
        {data.blocks.map((b, i) => (
          <div key={i} className="p-4 border border-border rounded-md space-y-2">
            <div className="flex items-start justify-between gap-2">
              <input value={b.title} onChange={(e) => updateBlock(i, { title: e.target.value })}
                placeholder="Заголовок блока" className="flex-1 px-3 py-2 text-sm rounded border border-border bg-background" />
              <button onClick={() => removeBlock(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea value={b.text} onChange={(e) => updateBlock(i, { text: e.target.value })}
              rows={4} placeholder="Текст (можно с переносами строк)"
              className="w-full px-3 py-2 text-sm rounded border border-border bg-background" />

            {/* Images */}
            <div className="flex flex-wrap gap-2">
              {(b.images || []).map((img, ii) => (
                <div key={ii} className="relative w-24 h-24 rounded overflow-hidden border border-border bg-secondary">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i, ii)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-black/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input ref={(el) => { fileInputs.current[i] = el; }} type="file" accept="image/*" hidden
                onChange={(e) => e.target.files?.[0] && addImage(i, e.target.files[0])} />
              <button onClick={() => fileInputs.current[i]?.click()}
                className="w-24 h-24 rounded border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-1">
                <Upload className="w-4 h-4" />
                Фото
              </button>
            </div>
          </div>
        ))}

        <button onClick={addBlock}
          className="w-full inline-flex items-center justify-center gap-1 text-sm px-3 py-2 rounded border border-dashed border-border hover:bg-accent">
          <Plus className="w-4 h-4" /> Добавить блок
        </button>
      </div>
    </section>
  );
};

interface PriceRow { name: string; unit: string; price: string }
interface PricingData { title: string; note: string; rows: PriceRow[] }

const InstallationPricingEditor = () => {
  const { token } = useAdminAuth();
  const [data, setData] = useState<PricingData>({ title: 'Смета монтажных работ', note: '', rows: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent<PricingData>('installation_pricing').then((d) => {
      if (d && Array.isArray(d.rows)) setData({ title: d.title || 'Смета монтажных работ', note: d.note || '', rows: d.rows });
      setLoading(false);
    });
  }, []);

  const updateRow = (i: number, patch: Partial<PriceRow>) =>
    setData((d) => ({ ...d, rows: d.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try { await saveContent('installation_pricing', data, token); toast.success('Смета сохранена'); }
    catch { toast.error('Ошибка сохранения'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <section className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Смета монтажа (Замер и монтаж)
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setData((d) => ({ ...d, rows: [...d.rows, { name: '', unit: 'шт.', price: '' }] }))}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border border-border hover:bg-accent">
            <Plus className="w-4 h-4" /> Добавить работу
          </button>
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Заголовок сметы" className="px-3 py-2 text-sm rounded border border-border bg-background" />
        <input value={data.note} onChange={(e) => setData({ ...data, note: e.target.value })}
          placeholder="Примечание под таблицей" className="px-3 py-2 text-sm rounded border border-border bg-background" />
      </div>

      <div className="space-y-2">
        {data.rows.map((r, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={r.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="Название работы"
              className="flex-1 px-3 py-2 text-sm rounded border border-border bg-background" />
            <input value={r.unit} onChange={(e) => updateRow(i, { unit: e.target.value })} placeholder="Ед."
              className="w-24 px-3 py-2 text-sm rounded border border-border bg-background" />
            <input value={r.price} onChange={(e) => updateRow(i, { price: e.target.value })} placeholder="Цена, ₽"
              className="w-32 px-3 py-2 text-sm rounded border border-border bg-background" />
            <button onClick={() => setData((d) => ({ ...d, rows: d.rows.filter((_, idx) => idx !== i) }))}
              className="p-2 text-destructive hover:bg-destructive/10 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {data.rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Пока пусто — на сайте показывается стандартный список работ с пометкой «по запросу».</p>
        )}
      </div>
    </section>
  );
};

const PagesPage = () => (
  <div className="p-6 space-y-6 max-w-5xl">
    <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
      Страницы сайта
    </h1>
    {PAGES.map((p) => <PageEditor key={p.key} k={p.key} label={p.label} defaults={p.defaults} />)}
    <InstallationPricingEditor />
  </div>
);

export default PagesPage;


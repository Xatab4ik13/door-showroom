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

const PagesPage = () => (
  <div className="p-6 space-y-6 max-w-5xl">
    <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
      Страницы сайта
    </h1>
    {PAGES.map((p) => <PageEditor key={p.key} k={p.key} label={p.label} defaults={p.defaults} />)}
  </div>
);

export default PagesPage;

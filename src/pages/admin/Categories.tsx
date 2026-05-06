import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { fetchCategories, createCategory, updateCategory, deleteCategory, type AdminCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, FolderPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormState { id?: number; slug: string; name: string; parent_id: string; sort_order: string; }
const blank: FormState = { slug: '', name: '', parent_id: '', sort_order: '0' };

const Categories = () => {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); fetchCategories().then((d) => { setItems(d); setLoading(false); }); };
  useEffect(load, []);

  const openNew = (parentId?: number) => {
    setForm({ ...blank, parent_id: parentId ? String(parentId) : '' });
    setOpen(true);
  };
  const openEdit = (c: AdminCategory) => {
    setForm({ id: c.id, slug: c.slug, name: c.name,
      parent_id: c.parent_id ? String(c.parent_id) : '', sort_order: String(c.sort_order || 0) });
    setOpen(true);
  };

  const save = async () => {
    if (!token) return;
    if (!form.slug || !form.name) { toast({ title: 'Заполните slug и название', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug, name: form.name,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        sort_order: Number(form.sort_order) || 0,
      };
      if (form.id) await updateCategory(form.id, payload, token);
      else await createCategory(payload, token);
      toast({ title: 'Сохранено' });
      setOpen(false); load();
    } catch (e: any) {
      toast({ title: e.message || 'Ошибка', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const remove = async (c: AdminCategory) => {
    if (!token) return;
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    try { await deleteCategory(c.id, token); toast({ title: 'Удалено' }); load(); }
    catch (e: any) { toast({ title: e.message || 'Ошибка', variant: 'destructive' }); }
  };

  const roots = items.filter(c => !c.parent_id);
  const childrenOf = (id: number) => items.filter(c => c.parent_id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}>
            Категории
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} всего</p>
        </div>
        <Button onClick={() => openNew()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Новая категория
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}>
                  <th className="p-3">Название</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Товаров</th>
                  <th className="p-3">Порядок</th>
                  <th className="p-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {roots.map(root => (
                  <Row key={root.id} cat={root} depth={0} childrenOf={childrenOf} onEdit={openEdit} onDelete={remove} onAddChild={openNew} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {form.id ? 'Редактировать категорию' : 'Новая категория'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs uppercase tracking-wider">Название *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">Slug (латиница, без пробелов) *</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="mezhkomnatnye" className="mt-1 font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider">Родитель</Label>
                <Select value={form.parent_id || 'none'} onValueChange={(v) => setForm({ ...form, parent_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Корневая —</SelectItem>
                    {items
                      .filter(c => c.id !== form.id)
                      .map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.parent_id ? '— ' : ''}{c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Порядок</Label>
                <Input type="number" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Row = ({ cat, depth, childrenOf, onEdit, onDelete, onAddChild }: {
  cat: AdminCategory; depth: number;
  childrenOf: (id: number) => AdminCategory[];
  onEdit: (c: AdminCategory) => void;
  onDelete: (c: AdminCategory) => void;
  onAddChild: (parentId: number) => void;
}) => {
  const kids = childrenOf(cat.id);
  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30">
        <td className="p-3" style={{ paddingLeft: 12 + depth * 24 }}>
          <span className="text-foreground">{depth > 0 && '└ '}{cat.name}</span>
        </td>
        <td className="p-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
        <td className="p-3 text-xs text-muted-foreground">{cat.product_count}</td>
        <td className="p-3 text-xs text-muted-foreground">{cat.sort_order}</td>
        <td className="p-3 text-right whitespace-nowrap">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" title="Добавить подкатегорию" onClick={() => onAddChild(cat.id)}>
            <FolderPlus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Редактировать" onClick={() => onEdit(cat)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" title="Удалить" onClick={() => onDelete(cat)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </td>
      </tr>
      {kids.map(k => <Row key={k.id} cat={k} depth={depth + 1} childrenOf={childrenOf} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />)}
    </>
  );
};

export default Categories;

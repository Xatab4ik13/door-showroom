import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { fetchLeads, updateLeadStatus, MeasureLead } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = [
  { value: 'new', label: 'Новая' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' },
  { value: 'cancelled', label: 'Отменена' },
];

const AdminLeads = () => {
  const { token } = useAdminAuth();
  const [leads, setLeads] = useState<MeasureLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchLeads(token).then((d) => { setLeads(d); setLoading(false); });
  }, [token]);

  const changeStatus = async (id: number, status: string) => {
    if (!token) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try { await updateLeadStatus(id, status, token); } catch { toast.error('Не удалось обновить статус'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Oswald', sans-serif" }}>
        Заявки на замер
      </h1>

      {leads.length === 0 ? (
        <p className="text-muted-foreground">Заявок пока нет.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Телефон</th>
                <th className="px-4 py-3">Адрес</th>
                <th className="px-4 py-3">Комментарий</th>
                <th className="px-4 py-3 w-40">Статус</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(l.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{l.phone}</td>
                  <td className="px-4 py-3">{l.address || '—'}</td>
                  <td className="px-4 py-3 max-w-sm">{l.comment || '—'}</td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={(e) => changeStatus(l.id, e.target.value)}
                      className="px-2 py-1 rounded border border-border bg-background text-sm">
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;

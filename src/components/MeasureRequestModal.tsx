import { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { submitMeasureRequest } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MeasureRequestModal = ({ open, onClose }: Props) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !agreed) return;
    setSending(true);
    setError('');
    try {
      await submitMeasureRequest({ name: name.trim(), phone: phone.trim(), address: address.trim(), comment: comment.trim() });
      setDone(true);
      setName(''); setPhone(''); setAddress(''); setComment(''); setAgreed(false);
    } catch {
      setError('Не удалось отправить заявку. Позвоните нам, пожалуйста.');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-background border border-border p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground" aria-label="Закрыть">
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-[hsl(205,85%,45%)] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Заявка отправлена
            </h3>
            <p className="mt-2 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Менеджер свяжется с вами, уточнит детали и подтвердит стоимость замера.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Заявка на замер
            </h3>
            <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Оставьте контакты — менеджер уточнит количество проёмов, адрес и подтвердит стоимость до выезда специалиста.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required
                placeholder="Ваше имя"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={50} required
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500}
                placeholder="Адрес объекта (город, район)"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3}
                placeholder="Количество проёмов, удобное время, пожелания"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground" />

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
                <span>Согласен с обработкой персональных данных</span>
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button type="submit" disabled={sending || !agreed}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[hsl(205,85%,45%)] text-white font-semibold uppercase tracking-wider disabled:opacity-50"
                style={{ fontFamily: "'Oswald', sans-serif" }}>
                {sending && <Loader2 className="w-4 h-4 animate-spin" />} Отправить заявку
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MeasureRequestModal;

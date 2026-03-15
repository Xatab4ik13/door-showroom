import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

type Step = 'email' | 'code' | 'done';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customer-auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      } else {
        setStep('code');
      }
    } catch {
      setError('Сервер недоступен');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customer-auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка');
      } else {
        setStep('done');
      }
    } catch {
      setError('Сервер недоступен');
    }
    setLoading(false);
  };

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <h1
        className="text-3xl font-bold uppercase tracking-wide text-foreground mb-2"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        Восстановление пароля
      </h1>

      {step === 'email' && (
        <>
          <p className="text-muted-foreground text-sm mb-8">
            Введите email, на который зарегистрирован аккаунт. Мы отправим код для восстановления.
          </p>
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Отправить код
            </button>
          </form>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="text-muted-foreground text-sm mb-8">
            Код отправлен на <strong>{email}</strong>. Введите его и задайте новый пароль.
          </p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-значный код"
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-center tracking-[0.3em] text-lg font-mono"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новый пароль"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите пароль"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Сменить пароль
            </button>
          </form>
        </>
      )}

      {step === 'done' && (
        <div className="text-center mt-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-foreground font-medium mb-2">Пароль успешно изменён!</p>
          <p className="text-sm text-muted-foreground mb-6">Теперь вы можете войти с новым паролем.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Войти
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;

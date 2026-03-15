import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let err: string | null;
    if (mode === 'login') {
      err = await login(email, password);
    } else {
      if (!name.trim()) {
        setError('Укажите имя');
        setLoading(false);
        return;
      }
      err = await register(email, password, name, phone);
    }

    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate('/account');
    }
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
        {mode === 'login' ? 'Вход' : 'Регистрация'}
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        {mode === 'login'
          ? 'Войдите, чтобы отслеживать заказы'
          : 'Создайте аккаунт для отслеживания заказов'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67 (необязательно)"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </>
        )}

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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
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
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      {mode === 'login' && (
        <p className="text-sm text-center text-muted-foreground mt-4">
          <button onClick={() => navigate('/reset-password')} className="text-primary hover:underline">
            Забыли пароль?
          </button>
        </p>
      )}

      <p className="text-sm text-center text-muted-foreground mt-3">
        {mode === 'login' ? (
          <>
            Нет аккаунта?{' '}
            <button onClick={() => { setMode('register'); setError(''); }} className="text-primary hover:underline">
              Зарегистрироваться
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт?{' '}
            <button onClick={() => { setMode('login'); setError(''); }} className="text-primary hover:underline">
              Войти
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default Login;

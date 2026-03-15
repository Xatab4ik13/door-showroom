import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminLogin = () => {
  const { loginAdmin, isAdminAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdminAuthenticated && !loading) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login.trim() || !password.trim()) {
      setError('Введите логин и пароль');
      return;
    }

    setSubmitting(true);
    const loginError = await loginAdmin(login.trim(), password.trim());
    setSubmitting(false);

    if (!loginError) {
      navigate('/admin', { replace: true });
    } else {
      setError(loginError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-border rounded-2xl p-8 space-y-8 bg-card"
      >
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="RUSDOORS" className="h-16 w-auto" />
          <div className="text-center">
            <h1
              className="text-2xl tracking-wider uppercase text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
            >
              Панель управления
            </h1>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Войдите для доступа к системе
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="login"
              className="text-xs uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Логин
            </Label>
            <Input
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="bg-background border-border focus-visible:ring-[hsl(205,85%,45%)]"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="bg-background border-border focus-visible:ring-[hsl(205,85%,45%)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={submitting || loading}
          className="w-full gap-2 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,40%)] text-white uppercase tracking-wider disabled:opacity-70"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          <LogIn className="w-4 h-4" />
          {submitting ? 'Вход...' : 'Войти'}
        </Button>

        <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Доступ только для сотрудников
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;

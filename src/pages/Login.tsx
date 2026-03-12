import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { login, verifyCode, pendingPhone } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    setError('');
    login(phone);
  };

  const handleVerify = () => {
    const ok = verifyCode(code);
    if (ok) {
      navigate('/account');
    } else {
      setError('Неверный код. Для демо используйте: 1234');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-md mx-auto">
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
          Вход
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {pendingPhone
            ? `Мы отправили SMS-код на ${pendingPhone}`
            : 'Введите номер телефона для входа'}
        </p>

        {!pendingPhone ? (
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30 focus:border-[hsl(205,85%,45%)]"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              onClick={handleSendCode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Получить код
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newCode = code.split('');
                    newCode[i] = val;
                    setCode(newCode.join(''));
                    if (val && e.target.nextElementSibling instanceof HTMLInputElement) {
                      e.target.nextElementSibling.focus();
                    }
                  }}
                  className="w-14 h-14 text-center text-2xl font-bold border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30 focus:border-[hsl(205,85%,45%)]"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                />
              ))}
            </div>
            {error && <p className="text-xs text-destructive text-center">{error}</p>}
            <button
              onClick={handleVerify}
              className="w-full py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Подтвердить
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Для демо: код <span className="font-bold text-foreground">1234</span>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Login;

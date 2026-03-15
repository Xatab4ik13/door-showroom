import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

export type AdminRole = 'admin' | 'manager';

export interface AdminUser {
  id: string;
  login: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  loginAdmin: (login: string, password: string) => Promise<string | null>;
  logoutAdmin: () => void;
  token: string | null;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_KEY = 'rusdoors_admin';
const TOKEN_KEY = 'rusdoors_admin_token';

function mapAdminUser(user: { id: number; email: string; name: string | null }): AdminUser {
  const role: AdminRole = user.email === 'manager' ? 'manager' : 'admin';
  return {
    id: String(user.id),
    login: user.email,
    name: user.name || (role === 'manager' ? 'Менеджер' : 'Администратор'),
    role,
  };
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    else localStorage.removeItem(ADMIN_KEY);
  }, [admin]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    let active = true;

    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!active) return;
        if (!res.ok) throw new Error('Unauthorized');
        const me = await res.json();
        setAdmin(mapAdminUser(me));
      })
      .catch(() => {
        if (!active) return;
        setAdmin(null);
        setToken(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const loginAdmin = async (login: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: login, password }),
      });

      const data = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
      if (!res.ok) return data.error || 'Ошибка входа';

      setToken(data.token);
      setAdmin(mapAdminUser(data.user));
      return null;
    } catch {
      return 'Сервер недоступен';
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ admin, isAdminAuthenticated: !!admin && !!token, loading, loginAdmin, logoutAdmin, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

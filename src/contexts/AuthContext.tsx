import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

export interface CustomerUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  discount: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<string | null>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  orders: CustomerOrder[];
  loadOrders: () => Promise<void>;
  ordersLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'rusdoors_customer_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const authHeaders = (t: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${t}`,
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/customer-auth/me`, { headers: authHeaders(token) })
      .then(async (res) => {
        if (res.ok) {
          setUser(await res.json());
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/customer-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Ошибка входа';
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return null;
    } catch {
      return 'Сервер недоступен';
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/customer-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || 'Ошибка регистрации';
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return null;
    } catch {
      return 'Сервер недоступен';
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setOrders([]);
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/customer-auth/profile`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setUser(await res.json());
    }
  };

  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/my/list`, {
        headers: authHeaders(token),
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch { /* ignore */ }
    setOrdersLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, logout, updateProfile, orders, loadOrders, ordersLoading, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
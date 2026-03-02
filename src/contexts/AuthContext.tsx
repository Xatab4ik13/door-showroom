import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface MockUser {
  id: string;
  phone: string;
  name: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  city: string;
  street: string;
  apartment: string;
}

export interface MockOrder {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (phone: string) => void;
  verifyCode: (code: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Pick<MockUser, 'name' | 'phone'>>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  orders: MockOrder[];
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'rusdoors_user';
const ORDERS_KEY = 'rusdoors_orders';

const MOCK_CODE = '1234';

const mockOrders: MockOrder[] = [
  {
    id: 'ORD-001', date: '2026-02-15', status: 'delivered',
    items: [{ name: 'Vetro', quantity: 1, price: 12900 }], total: 12900,
  },
  {
    id: 'ORD-002', date: '2026-02-28', status: 'shipped',
    items: [{ name: 'Nero', quantity: 2, price: 34500 }], total: 69000,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [orders] = useState<MockOrder[]>(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : mockOrders;
    } catch { return mockOrders; }
  });
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const login = (phone: string) => {
    setPendingPhone(phone);
  };

  const verifyCode = (code: string): boolean => {
    if (code === MOCK_CODE && pendingPhone) {
      setUser({
        id: crypto.randomUUID(),
        phone: pendingPhone,
        name: '',
        addresses: [],
      });
      setPendingPhone(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setPendingPhone(null);
  };

  const updateProfile = (data: Partial<Pick<MockUser, 'name' | 'phone'>>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    setUser((prev) => prev ? {
      ...prev,
      addresses: [...prev.addresses, { ...address, id: crypto.randomUUID() }],
    } : prev);
  };

  const removeAddress = (id: string) => {
    setUser((prev) => prev ? {
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
    } : prev);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, verifyCode, logout, updateProfile, addAddress, removeAddress, orders, pendingPhone }}
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

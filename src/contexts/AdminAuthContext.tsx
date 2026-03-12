import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  loginAdmin: (login: string, password: string) => boolean;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_KEY = 'rusdoors_admin';

// Demo accounts — will be replaced with real auth later
const DEMO_ACCOUNTS: { login: string; password: string; user: AdminUser }[] = [
  {
    login: 'admin',
    password: 'admin123',
    user: { id: '1', login: 'admin', name: 'Администратор', role: 'admin' },
  },
  {
    login: 'manager',
    password: 'manager123',
    user: { id: '2', login: 'manager', name: 'Менеджер', role: 'manager' },
  },
];

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    else localStorage.removeItem(ADMIN_KEY);
  }, [admin]);

  const loginAdmin = (login: string, password: string): boolean => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.login === login && a.password === password,
    );
    if (account) {
      setAdmin(account.user);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => setAdmin(null);

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAdminAuthenticated: !!admin, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

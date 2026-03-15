import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';

const AdminLayout = () => {
  const { isAdminAuthenticated, admin, loading } = useAdminAuth();

  if (loading) {
    return null;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-6 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-foreground font-medium"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {admin?.name}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span
                className="text-[10px] uppercase tracking-[0.15em] text-[hsl(205,85%,45%)]"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {admin?.role === 'admin' ? 'Администратор' : 'Менеджер'}
              </span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

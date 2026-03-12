import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const mainNav = [
  { title: 'Дашборд', url: '/admin', icon: LayoutDashboard },
  { title: 'Заказы', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Товары', url: '/admin/products', icon: Package },
  { title: 'Поставщики', url: '/admin/suppliers', icon: Truck },
  { title: 'Клиенты', url: '/admin/customers', icon: Users },
];

const settingsNav = [
  { title: 'Настройки', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { admin, logoutAdmin } = useAdminAuth();

  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent>
        {/* Brand */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-border">
          <img src={logo} alt="RUSDOORS" className="h-8 w-auto shrink-0" />
          {!collapsed && (
            <span
              className="text-xs uppercase tracking-[0.15em] text-foreground font-medium truncate"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Админ
            </span>
          )}
        </div>

        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Основное
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                      activeClassName="bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)] font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span
                          className="text-[13px] tracking-wide"
                          style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings — admin only */}
        {admin?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Система
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                        activeClassName="bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)] font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span
                            className="text-[13px] tracking-wide"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                          >
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && admin && (
          <div className="mb-3 px-1">
            <p
              className="text-sm font-medium text-foreground truncate"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {admin.name}
            </p>
            <p
              className="text-[10px] uppercase tracking-[0.15em] text-[hsl(205,85%,45%)]"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {admin.role === 'admin' ? 'Администратор' : 'Менеджер'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logoutAdmin}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-xs">Выйти</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

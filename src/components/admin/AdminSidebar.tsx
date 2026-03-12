import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Brand */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-sidebar-border">
          {!collapsed && (
            <span className="font-semibold text-sm text-sidebar-foreground truncate">
              RusDoors Admin
            </span>
          )}
        </div>

        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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
            <SidebarGroupLabel>Система</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
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
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && admin && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {admin.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{admin.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logoutAdmin}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

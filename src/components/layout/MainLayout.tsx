// src/components/layout/MainLayout.tsx
import React from 'react';
import {
  Menu,
  DollarSign,
  BarChart,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import { useUserRole } from '@/hooks/useUserRole';
import type { AppRole } from '@/types/firestoreTypes';
import { signOut } from 'firebase/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

type MenuItem = {
  icon: typeof BarChart;
  label: string;
  path: string;
  color: string;
  roles: AppRole[];
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const { firebaseUser, role } = useUserRole();

  const allMenuItems: MenuItem[] = [
    {
      icon: BarChart,
      label: 'Dashboard',
      path: '/',
      color: 'text-finance-primary',
      roles: ['admin', 'operator'],
    },
    {
      icon: DollarSign,
      label: 'Transacciones',
      path: '/transactions',
      color: 'text-finance-positive',
      roles: ['admin', 'operator'],
    },
    {
      icon: TrendingUp,
      label: 'Reportes',
      path: '/reports',
      color: 'text-finance-eur',
      roles: ['admin'],
    },
    {
      icon: Settings,
      label: 'Configuración',
      path: '/settings',
      color: 'text-muted-foreground',
      roles: ['admin'],
    },
  ];

  const menuItems = React.useMemo(
    () =>
      allMenuItems.filter((item) =>
        role ? item.roles.includes(role) : true
      ),
    [role]
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada exitosamente');
      navigate('/auth');
    } catch (error) {
      console.error(error);
      toast.error('Error al cerrar sesión');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const userInitial =
    firebaseUser?.displayName?.charAt(0)?.toUpperCase() ??
    firebaseUser?.email?.charAt(0)?.toUpperCase() ??
    'U';

  const roleLabel =
    role === 'admin' ? 'Administrador' : role === 'operator' ? 'Operador' : '';

  return (
    <div className="flex h-screen bg-finance-background">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
                   ${isCollapsed ? 'w-20' : 'w-72'} 
                   fixed inset-y-0 left-0 z-50 bg-finance-surface 
                   border-r border-sidebar-border shadow-card transition-all duration-300 ease-in-out 
                   md:relative md:translate-x-0
                   flex flex-col`}
      >
        {/* Header sidebar */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-sidebar-border bg-finance-surface">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-finance-primary rounded-xl flex items-center justify-center shadow-soft">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-finance-positive rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-finance-primary">
                  SafeExchange
                </h1>
                <span className="text-xs text-muted-foreground font-medium">
                  Exchange Platform
                </span>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
            >
              <Menu className="h-4 w-4 text-sidebar-foreground transition-transform" />
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors md:hidden"
            >
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-auto">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const isActiveItem = isActive(item.path);
              const Icon = item.icon;

              return (
                <div
                  key={item.path}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full text-left group relative flex items-center rounded-xl px-4 py-3.5 transition-all duration-200
                              ${isCollapsed ? 'justify-center' : 'gap-4'}
                              ${
                                isActiveItem
                                  ? 'bg-finance-primary/10 text-finance-primary border border-finance-primary/30 shadow-soft'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                              }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        isActiveItem
                          ? 'bg-finance-primary/20'
                          : 'group-hover:bg-finance-primary/10'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 transition-all duration-200 ${
                          isActiveItem
                            ? item.color
                            : 'text-sidebar-foreground'
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm">
                          {item.label}
                        </span>
                        {isActiveItem && (
                          <div className="w-8 h-0.5 bg-finance-primary rounded-full mt-1" />
                        )}
                      </div>
                    )}
                    {isActiveItem && (
                      <div className="absolute right-2 w-2 h-2 bg-finance-primary rounded-full" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl px-4 py-3 text-sidebar-foreground hover:bg-finance-negative/10 hover:text-finance-negative transition-all duration-200 group border border-transparent hover:border-finance-negative/20 ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className="p-1.5 rounded-lg group-hover:bg-finance-negative/20 transition-colors flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="font-medium">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-sidebar-border shadow-card">
          <div className="flex h-16 items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-finance-primary/10 transition-colors md:hidden group"
            >
              <Menu className="h-5 w-5 text-foreground transition-transform" />
            </button>

            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-finance-surface border border-finance-primary/20">
                <div className="w-8 h-8 rounded-full bg-finance-primary flex items-center justify-center shadow-soft">
                  <span className="text-white text-sm font-bold">
                    {userInitial}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-semibold text-foreground">
                    {firebaseUser?.displayName ||
                      firebaseUser?.email ||
                      'Usuario'}
                  </span>
                  {roleLabel && (
                    <div className="text-xs text-muted-foreground">
                      {roleLabel}
                    </div>
                  )}
                </div>
                <div className="w-2 h-2 bg-finance-positive rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-finance-background">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { Menu, DollarSign, BarChart, Settings, LogOut, Shield, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/auth');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const menuItems = [
    { 
      icon: BarChart, 
      label: 'Dashboard', 
      path: '/',
      color: 'text-finance-primary'
    },
    { 
      icon: DollarSign, 
      label: 'Transacciones', 
      path: '/transactions',
      color: 'text-finance-positive'
    },
    { 
      icon: TrendingUp, 
      label: 'Reportes', 
      path: '/reports',
      color: 'text-finance-eur' 
    },
    { 
      icon: Settings, 
      label: 'Configuración', 
      path: '/settings',
      color: 'text-muted-foreground'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-finance-background">
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Clean Sidebar */}
      <div 
        className={`${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
                   ${isCollapsed ? 'w-20' : 'w-72'} 
                   fixed inset-y-0 left-0 z-50 bg-finance-surface 
                   border-r border-sidebar-border shadow-card transition-all duration-300 ease-in-out 
                   md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-sidebar-border bg-finance-surface">
          <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
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
                <span className="text-xs text-muted-foreground font-medium">Exchange Platform</span>
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
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const isActiveItem = isActive(item.path);
              const Icon = item.icon;
              
              return (
                <div key={item.path} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <a 
                    href={item.path} 
                    className={`group relative flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200
                              ${isActiveItem 
                                ? 'bg-finance-primary/10 text-finance-primary border border-finance-primary/30 shadow-soft' 
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                              }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${isActiveItem ? 'bg-finance-primary/20' : 'group-hover:bg-finance-primary/10'}`}>
                      <Icon className={`h-5 w-5 transition-all duration-200 ${isActiveItem ? item.color : 'text-sidebar-foreground'}`} />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{item.label}</span>
                        {isActiveItem && <div className="w-8 h-0.5 bg-finance-primary rounded-full mt-1" />}
                      </div>
                    )}
                    {isActiveItem && (
                      <div className="absolute right-2 w-2 h-2 bg-finance-primary rounded-full" />
                    )}
                  </a>
                </div>
              );
            })}
          </div>

        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <button 
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground hover:bg-finance-negative/10 hover:text-finance-negative transition-all duration-200 group border border-transparent hover:border-finance-negative/20 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="p-1.5 rounded-lg group-hover:bg-finance-negative/20 transition-colors">
              <LogOut className="h-4 w-4 transition-transform" />
            </div>
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Clean Header */}
        <header className="bg-white border-b border-sidebar-border shadow-card">
          <div className="flex h-16 items-center justify-between px-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-xl hover:bg-finance-primary/10 transition-colors md:hidden group"
            >
              <Menu className="h-5 w-5 text-foreground transition-transform" />
            </button>
            
            <div className="ml-auto flex items-center gap-4">
              
              {/* User Profile */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-finance-surface border border-finance-primary/20">
                <div className="w-8 h-8 rounded-full bg-finance-primary flex items-center justify-center shadow-soft">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-semibold text-foreground">Admin</span>
                  <div className="text-xs text-muted-foreground">Administrador</div>
                </div>
                <div className="w-2 h-2 bg-finance-positive rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-finance-background">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
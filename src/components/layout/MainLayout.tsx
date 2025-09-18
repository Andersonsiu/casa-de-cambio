
import React from 'react';
import { Menu, FileText, DollarSign, BarChart, Settings, LogOut, Shield, TrendingUp, Wallet, CreditCard, Users, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  const menuItems = [
    { 
      icon: BarChart, 
      label: 'Dashboard', 
      path: '/',
      color: 'text-finance-secondary'
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
    <div className="flex h-screen bg-gradient-to-br from-finance-background via-background to-muted/20">
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Advanced Sidebar */}
      <div 
        className={`${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
                   ${isCollapsed ? 'w-20' : 'w-72'} 
                   fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-sidebar-background via-sidebar-background to-sidebar-background/95 
                   backdrop-blur-xl border-r border-sidebar-border/50 shadow-2xl transition-all duration-300 ease-in-out 
                   md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-sidebar-border/30 bg-gradient-to-r from-finance-primary/10 to-finance-secondary/10">
          <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-finance-secondary to-finance-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-finance-positive rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-finance-primary to-finance-secondary bg-clip-text text-transparent">
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
              <Menu className="h-4 w-4 text-sidebar-foreground group-hover:scale-110 transition-transform" />
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

        {/* Stats Overview */}
        {!isCollapsed && (
          <div className="px-4 py-4 border-b border-sidebar-border/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-finance-positive/10 to-finance-positive/5 p-3 rounded-lg border border-finance-positive/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-finance-positive" />
                  <span className="text-xs font-medium text-sidebar-foreground">Ganancia</span>
                </div>
                <p className="text-sm font-bold text-finance-positive mt-1">+$2,450</p>
              </div>
              <div className="bg-gradient-to-br from-finance-secondary/10 to-finance-secondary/5 p-3 rounded-lg border border-finance-secondary/20">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-finance-secondary" />
                  <span className="text-xs font-medium text-sidebar-foreground">Caja</span>
                </div>
                <p className="text-sm font-bold text-finance-secondary mt-1">$15,850</p>
              </div>
            </div>
          </div>
        )}

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
                    className={`group relative flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                              ${isActiveItem 
                                ? 'bg-gradient-to-r from-finance-primary/20 to-finance-secondary/20 text-finance-primary border border-finance-primary/30 shadow-md' 
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                              }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${isActiveItem ? 'bg-finance-primary/10' : 'group-hover:bg-finance-primary/10'}`}>
                      <Icon className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${isActiveItem ? item.color : 'text-sidebar-foreground'}`} />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{item.label}</span>
                        {isActiveItem && <div className="w-8 h-0.5 bg-gradient-to-r from-finance-primary to-finance-secondary rounded-full mt-1" />}
                      </div>
                    )}
                    {isActiveItem && (
                      <div className="absolute right-2 w-2 h-2 bg-finance-primary rounded-full animate-pulse" />
                    )}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="mt-8 pt-6 border-t border-sidebar-border/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Acciones Rápidas
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-finance-positive/10 hover:text-finance-positive rounded-lg transition-all duration-200 group">
                  <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Nueva Transacción
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-finance-secondary/10 hover:text-finance-secondary rounded-lg transition-all duration-200 group">
                  <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Gestionar Clientes
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/30 p-4">
          {/* Notifications */}
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-medium text-muted-foreground">Notificaciones</span>
              <div className="flex items-center gap-1">
                <Bell className="h-4 w-4 text-finance-secondary" />
                <span className="text-xs bg-finance-negative text-white px-1.5 py-0.5 rounded-full">3</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground hover:bg-finance-negative/10 hover:text-finance-negative transition-all duration-200 group border border-transparent hover:border-finance-negative/20 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="p-1.5 rounded-lg group-hover:bg-finance-negative/10 transition-colors">
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </div>
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card shadow-soft border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="text-sm font-medium text-foreground">Admin</span>
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

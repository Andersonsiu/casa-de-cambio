
import React from 'react';
import { Menu, FileText, DollarSign, BarChart, Settings, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogout = () => {
    // En una aplicación real, aquí se limpiarían los tokens de autenticación
    // Por ahora, simplemente redirigimos a la página principal y mostramos un mensaje
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-finance-background">
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
                   fixed inset-y-0 left-0 z-50 w-64 bg-gradient-primary shadow-strong transition-all duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/20">
          <h1 className="text-xl font-bold text-white">ForexPro</h1>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-1 rounded-lg hover:bg-white/10 transition-colors md:hidden"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-3">
            <li>
              <a 
                href="/" 
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <BarChart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Dashboard</span>
              </a>
            </li>
            <li>
              <a 
                href="/transactions" 
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <DollarSign className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Transacciones</span>
              </a>
            </li>
            <li>
              <a 
                href="/reports" 
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Reportes</span>
              </a>
            </li>
            <li>
              <a 
                href="/settings" 
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <Settings className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Configuración</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/20 p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/80 hover:bg-finance-negative hover:text-white transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Cerrar Sesión</span>
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

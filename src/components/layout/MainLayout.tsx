
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
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'} 
                   fixed inset-y-0 left-0 z-50 w-64 bg-finance-primary text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">ForexPro Cambios</h1>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            <li>
              <a href="/" className="flex items-center gap-4 rounded-md px-4 py-3 text-gray-300 hover:bg-finance-secondary hover:text-white">
                <BarChart className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/transactions" className="flex items-center gap-4 rounded-md px-4 py-3 text-gray-300 hover:bg-finance-secondary hover:text-white">
                <DollarSign className="h-5 w-5" />
                <span>Transacciones</span>
              </a>
            </li>
            <li>
              <a href="/reports" className="flex items-center gap-4 rounded-md px-4 py-3 text-gray-300 hover:bg-finance-secondary hover:text-white">
                <FileText className="h-5 w-5" />
                <span>Reportes</span>
              </a>
            </li>
            <li>
              <a href="/settings" className="flex items-center gap-4 rounded-md px-4 py-3 text-gray-300 hover:bg-finance-secondary hover:text-white">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-md px-4 py-3 text-gray-300 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

// ej. src/components/layout/AppShell.tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BarChart, DollarSign, TrendingUp, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, role } = useUserRole();

  const menuItems = [
    { icon: BarChart, label: "Dashboard", path: "/", roles: ["admin", "operator"] },
    { icon: DollarSign, label: "Transacciones", path: "/transactions", roles: ["admin", "operator"] },
    { icon: TrendingUp, label: "Reportes", path: "/reports", roles: ["admin"] },
    { icon: Settings, label: "Configuración", path: "/settings", roles: ["admin"] },
  ].filter(item => (role ? item.roles.includes(role) : true));

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      {/* SIDEBAR */}
      <Sidebar side="left" variant="inset" collapsible="icon">
        <SidebarHeader>
          {/* logo y título */}
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          {/* botón de logout */}
        </SidebarFooter>

        {/* barra para hacer click y “recoger/expandir” */}
        <SidebarRail />
      </Sidebar>

      {/* CONTENIDO */}
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4">
          {/* botón hamburguesa que colapsa/expande */}
          <SidebarTrigger className="mr-2" />
          <div className="ml-auto flex items-center gap-3">
            {/* info de usuario, rol, etc */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-finance-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;

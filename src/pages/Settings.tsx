
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';
import { useUserRole } from '@/hooks/useUserRole';

// Import refactored components
import ExchangeRateSettings from '@/components/settings/ExchangeRateSettings';
import ApiConfigSettings from '@/components/settings/ApiConfigSettings';
import UserManagement from '@/components/settings/UserManagement';
import SecuritySettings from '@/components/settings/SecuritySettings';

// Interface for User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  active: boolean;
}

const Settings: React.FC = () => {
  const [defaultRates, setDefaultRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const { isAdmin } = useUserRole();
  
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Admin Principal',
      email: 'admin@forexpro.com',
      role: 'admin',
      active: true
    }
  ]);
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30'
  });
  
  // Load exchange rates on component mount
  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      try {
        const data = await fetchExchangeRates();
        setDefaultRates(data);
      } catch (error) {
        console.error('Error al cargar tipos de cambio:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRates();
  }, []);
  
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <Tabs defaultValue="exchange-rates" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="exchange-rates">Tasas de Cambio</TabsTrigger>
          <TabsTrigger value="api-config">API Externa</TabsTrigger>
          {isAdmin && <TabsTrigger value="users">Usuarios</TabsTrigger>}
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exchange-rates">
          <ExchangeRateSettings 
            defaultRates={defaultRates}
            setDefaultRates={setDefaultRates}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>
        
        <TabsContent value="api-config">
          <ApiConfigSettings 
            apiKey={apiKey}
            setApiKey={setApiKey}
            apiEndpoint={apiEndpoint}
            setApiEndpoint={setApiEndpoint}
          />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="users">
            <UserManagement users={users} setUsers={setUsers} />
          </TabsContent>
        )}
        
        <TabsContent value="security">
          <SecuritySettings 
            security={security}
            setSecurity={setSecurity}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;

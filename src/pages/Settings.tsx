import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';
import { useUserRole } from '@/hooks/useUserRole';

// Componentes
import ExchangeRateSettings from '@/components/settings/ExchangeRateSettings';
import ApiConfigSettings from '@/components/settings/ApiConfigSettings';
import UserManagement from '@/components/settings/UserManagement';
import SecuritySettings from '@/components/settings/SecuritySettings';

const Settings: React.FC = () => {
  const [defaultRates, setDefaultRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const { isAdmin } = useUserRole();

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
  });

  // Cargar tasas al montar
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

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <div className="text-sm text-gray-500">{todayLabel}</div>
      </div>

      <Tabs defaultValue="exchange-rates" className="w-full">
        {/* Tabs visibles según rol */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="exchange-rates">Tasas de Cambio</TabsTrigger>

          {/* SOLO admin ve la pestaña de API */}
          {isAdmin && (
            <TabsTrigger value="api-config">API Externa</TabsTrigger>
          )}

          {/* SOLO admin ve la pestaña de Usuarios */}
          {isAdmin && (
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          )}

          {/* Ambos (admin y operador) ven Seguridad */}
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        {/* Contenidos */}
        <TabsContent value="exchange-rates">
          <ExchangeRateSettings
            defaultRates={defaultRates}
            setDefaultRates={setDefaultRates}
            loading={loading}
            setLoading={setLoading}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="api-config">
            <ApiConfigSettings
              apiKey={apiKey}
              setApiKey={setApiKey}
              apiEndpoint={apiEndpoint}
              setApiEndpoint={setApiEndpoint}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        <TabsContent value="security">
          {/* isAdmin define si ve opciones avanzadas o solo cambio de contraseña */}
          <SecuritySettings
            isAdmin={isAdmin}
            security={security}
            setSecurity={setSecurity}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;

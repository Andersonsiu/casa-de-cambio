// src/pages/settings.tsx
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';
import { useUserRole } from '@/hooks/useUserRole';

// Componentes refactorizados
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

  const [apiLoaded, setApiLoaded] = useState(false);

  // Cargar tasas de cambio
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

  // Ejemplo de carga inicial API (si quieres persistirlo después)
  useEffect(() => {
    if (apiLoaded) return;
    // Aquí podrías leer de Firestore o .env para popular apiKey / apiEndpoint
    setApiLoaded(true);
  }, [apiLoaded]);

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Valor por defecto de tab:
  // - Admin: "exchange-rates" (tiene más cosas)
  // - Operador: "security" o "exchange-rates", elige. Yo dejo "security"
  const defaultTab = isAdmin ? 'exchange-rates' : 'security';

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <div className="text-sm text-muted-foreground capitalize">{todayLabel}</div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        {/* TabsList centrado y con ancho máximo */}
        <div className="flex w-full justify-center mb-6">
          <TabsList className="inline-flex w-full max-w-3xl rounded-2xl bg-muted/80 p-1">
            <TabsTrigger value="exchange-rates" className="flex-1">
              Tasas de Cambio
            </TabsTrigger>

            {/* Solo admin ve API y Usuarios */}
            {isAdmin && (
              <>
                <TabsTrigger value="api-config" className="flex-1">
                  API Externa
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  Usuarios
                </TabsTrigger>
              </>
            )}

            <TabsTrigger value="security" className="flex-1">
              Seguridad
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenido centrado con max-width para que no quede perdido a la izquierda */}
        <TabsContent value="exchange-rates">
          <div className="mx-auto w-full max-w-4xl">
            <ExchangeRateSettings
              defaultRates={defaultRates}
              setDefaultRates={setDefaultRates}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="api-config">
            <div className="mx-auto w-full max-w-3xl">
              <ApiConfigSettings
                apiKey={apiKey}
                setApiKey={setApiKey}
                apiEndpoint={apiEndpoint}
                setApiEndpoint={setApiEndpoint}
              />
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="users">
            <div className="mx-auto w-full max-w-5xl">
              <UserManagement />
            </div>
          </TabsContent>
        )}

        <TabsContent value="security">
          {/* Seguridad centrada, dos cards una debajo de otra */}
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            <SecuritySettings />
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;

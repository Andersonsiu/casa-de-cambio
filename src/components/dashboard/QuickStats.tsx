
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Euro, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';
import { toast } from 'sonner';

const QuickStats: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates();
      setRates(data);
      toast.success('Tipos de cambio actualizados');
    } catch (error) {
      console.error('Error al cargar tipos de cambio:', error);
      toast.error('Error al cargar tipos de cambio');
    } finally {
      setLoading(false);
    }
  };

  // Cargar los tipos de cambio al montar el componente
  useEffect(() => {
    loadRates();
  }, []);

  // Preparar los datos para la visualización
  const getStats = () => {
    const usdData = rates.find(r => r.currency === 'USD');
    const eurData = rates.find(r => r.currency === 'EUR');
    
    return [
      {
        title: 'Compra USD',
        value: usdData ? `S/ ${usdData.buyRate.toFixed(2)}` : 'Cargando...',
        change: '+0.05',
        icon: <DollarSign className="h-6 w-6 text-green-600" />,
        trend: 'up',
      },
      {
        title: 'Venta USD',
        value: usdData ? `S/ ${usdData.sellRate.toFixed(2)}` : 'Cargando...',
        change: '+0.03',
        icon: <DollarSign className="h-6 w-6 text-green-600" />,
        trend: 'up',
      },
      {
        title: 'Compra EUR',
        value: eurData ? `S/ ${eurData.buyRate.toFixed(2)}` : 'Cargando...',
        change: '-0.02',
        icon: <Euro className="h-6 w-6 text-blue-600" />,
        trend: 'down',
      },
      {
        title: 'Venta EUR',
        value: eurData ? `S/ ${eurData.sellRate.toFixed(2)}` : 'Cargando...',
        change: '-0.01',
        icon: <Euro className="h-6 w-6 text-blue-600" />,
        trend: 'down',
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tipos de Cambio Actuales</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadRates} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;

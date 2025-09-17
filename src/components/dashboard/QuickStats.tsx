
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
        title: 'USD - Precio Mercado',
        value: usdData?.marketRate ? `S/ ${usdData.marketRate.toFixed(4)}` : 'Cargando...',
        change: usdData?.changePercent ? `${usdData.changePercent > 0 ? '+' : ''}${usdData.changePercent.toFixed(3)}%` : '+0.00%',
        icon: <DollarSign className="h-6 w-6 text-finance-usd" />,
        trend: (usdData?.changePercent || 0) >= 0 ? 'up' : 'down',
      },
      {
        title: 'Compra USD',
        value: usdData ? `S/ ${usdData.buyRate.toFixed(4)}` : 'Cargando...',
        change: usdData?.change ? `${usdData.change > 0 ? '+' : ''}${usdData.change.toFixed(4)}` : '+0.0000',
        icon: <DollarSign className="h-6 w-6 text-finance-usd" />,
        trend: (usdData?.change || 0) >= 0 ? 'up' : 'down',
      },
      {
        title: 'Venta USD',
        value: usdData ? `S/ ${usdData.sellRate.toFixed(4)}` : 'Cargando...',
        change: usdData?.change ? `${usdData.change > 0 ? '+' : ''}${usdData.change.toFixed(4)}` : '+0.0000',
        icon: <DollarSign className="h-6 w-6 text-finance-usd" />,
        trend: (usdData?.change || 0) >= 0 ? 'up' : 'down',
      },
      {
        title: 'EUR - Precio Mercado',
        value: eurData?.marketRate ? `S/ ${eurData.marketRate.toFixed(4)}` : 'Cargando...',
        change: eurData?.changePercent ? `${eurData.changePercent > 0 ? '+' : ''}${eurData.changePercent.toFixed(3)}%` : '+0.00%',
        icon: <Euro className="h-6 w-6 text-finance-eur" />,
        trend: (eurData?.changePercent || 0) >= 0 ? 'up' : 'down',
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Tipos de Cambio Actuales</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadRates} 
          disabled={loading}
          className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in border-0 bg-gradient-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-background/50 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-finance-positive" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-finance-negative" />
                )}
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-finance-positive' : 'text-finance-negative'
                }`}>
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

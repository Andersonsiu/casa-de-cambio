import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface PricePoint {
  time: string;
  usdRate: number;
  eurRate: number;
}

const ExchangeRateHistory: React.FC = () => {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);

  const generateMockHistory = () => {
    const now = new Date();
    const points: PricePoint[] = [];
    
    let baseUsd = 3.48;
    let baseEur = 3.85;
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Simular fluctuaciones realistas
      baseUsd += (Math.random() - 0.5) * 0.002;
      baseEur += (Math.random() - 0.5) * 0.003;
      
      points.push({
        time: time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        usdRate: parseFloat(baseUsd.toFixed(4)),
        eurRate: parseFloat(baseEur.toFixed(4))
      });
    }
    
    return points;
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = generateMockHistory();
      setHistory(mockData);
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getMaxMin = (currency: 'usd' | 'eur') => {
    if (history.length === 0) return { max: 0, min: 0, trend: 'neutral' };
    
    const rates = currency === 'usd' ? history.map(h => h.usdRate) : history.map(h => h.eurRate);
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const first = rates[0];
    const last = rates[rates.length - 1];
    const trend = last > first ? 'up' : last < first ? 'down' : 'neutral';
    
    return { max, min, trend };
  };

  const usdStats = getMaxMin('usd');
  const eurStats = getMaxMin('eur');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Precios (24h)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fluctuaciones de precios en las últimas 24 horas
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USD Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                USD/PEN
                {usdStats.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : usdStats.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Máximo 24h</p>
                <p className="font-medium text-green-600">S/ {usdStats.max.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mínimo 24h</p>
                <p className="font-medium text-red-600">S/ {usdStats.min.toFixed(4)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min</span>
                <span>Max</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full"></div>
            </div>
          </div>

          {/* EUR Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                EUR/PEN
                {eurStats.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : eurStats.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Máximo 24h</p>
                <p className="font-medium text-green-600">S/ {eurStats.max.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mínimo 24h</p>
                <p className="font-medium text-red-600">S/ {eurStats.min.toFixed(4)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min</span>
                <span>Max</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Últimas actualizaciones */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Últimas Actualizaciones</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {history.slice(-6).reverse().map((point, index) => (
              <div key={index} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="text-muted-foreground">{point.time}</span>
                <div className="flex gap-4">
                  <span>USD: S/ {point.usdRate.toFixed(4)}</span>
                  <span>EUR: S/ {point.eurRate.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateHistory;
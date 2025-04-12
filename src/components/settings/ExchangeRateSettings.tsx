
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Euro, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchExchangeRates, ExchangeRateData } from '@/services/exchangeRateService';

interface ExchangeRateSettingsProps {
  defaultRates: ExchangeRateData[];
  setDefaultRates: React.Dispatch<React.SetStateAction<ExchangeRateData[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExchangeRateSettings: React.FC<ExchangeRateSettingsProps> = ({ 
  defaultRates, 
  setDefaultRates, 
  loading,
  setLoading
}) => {
  // Cargar los tipos de cambio desde la "API"
  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await fetchExchangeRates();
      setDefaultRates(data);
      toast.success('Tipos de cambio actualizados desde la API');
    } catch (error) {
      console.error('Error al cargar tipos de cambio:', error);
      toast.error('Error al cargar tipos de cambio');
    } finally {
      setLoading(false);
    }
  };
  
  const updateRate = (id: string, field: 'buyRate' | 'sellRate', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setDefaultRates(rates => rates.map(rate => 
      rate.currency === id 
        ? { ...rate, [field]: numValue, lastUpdated: new Date() } 
        : rate
    ));
    
    toast.success('Tasa de cambio actualizada manualmente');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Configuración de Tasas de Cambio</CardTitle>
          <CardDescription>
            Configure las tasas de cambio predeterminadas para las operaciones
          </CardDescription>
        </div>
        <Button 
          variant="outline"
          onClick={loadRates}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar desde API
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Moneda</TableHead>
              <TableHead>Tasa de Compra (S/)</TableHead>
              <TableHead>Tasa de Venta (S/)</TableHead>
              <TableHead>Última Actualización</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defaultRates.map((rate) => (
              <TableRow key={rate.currency}>
                <TableCell className="flex items-center">
                  {rate.currency === 'USD' ? (
                    <>
                      <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                      Dólar Americano (USD)
                    </>
                  ) : (
                    <>
                      <Euro className="mr-2 h-4 w-4 text-blue-500" />
                      Euro (EUR)
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={rate.buyRate} 
                    onChange={(e) => updateRate(rate.currency, 'buyRate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={rate.sellRate} 
                    onChange={(e) => updateRate(rate.currency, 'sellRate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  {rate.lastUpdated.toLocaleString('es-PE')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateSettings;

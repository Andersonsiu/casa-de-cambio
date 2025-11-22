import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Firebase
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

interface Transaction {
  id: string;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  rate: number;
  transaction_date: string;
  created_at: string;
}

interface RateData {
  date: string;
  USD: number;
  EUR: number;
}

const ExchangeRateTrends: React.FC = () => {
  const [rateData, setRateData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      const transactionsRef = collection(db, 'transactions');
      
      // Obtener transacciones de los últimos 30 días
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const q = query(
        transactionsRef,
        where('transaction_date', '>=', startDate),
        where('transaction_date', '<=', endDate),
        orderBy('transaction_date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      // Procesar datos para el gráfico
      const processedData = processRateData(transactions);
      setRateData(processedData);

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast.error('Error al cargar tendencias de tipos de cambio');
    } finally {
      setLoading(false);
    }
  };

  const processRateData = (transactions: Transaction[]): RateData[] => {
    const dailyRates = new Map<string, { usdRates: number[]; eurRates: number[] }>();

    transactions.forEach(transaction => {
      const date = transaction.transaction_date;
      if (!dailyRates.has(date)) {
        dailyRates.set(date, { usdRates: [], eurRates: [] });
      }

      const dayData = dailyRates.get(date)!;
      
      if (transaction.currency === 'USD') {
        dayData.usdRates.push(transaction.rate);
      } else if (transaction.currency === 'EUR') {
        dayData.eurRates.push(transaction.rate);
      }
    });

    const result = Array.from(dailyRates.entries())
      .map(([date, rates]) => {
        const usdAvg = rates.usdRates.length > 0 
          ? rates.usdRates.reduce((a, b) => a + b, 0) / rates.usdRates.length 
          : 0;
        
        const eurAvg = rates.eurRates.length > 0 
          ? rates.eurRates.reduce((a, b) => a + b, 0) / rates.eurRates.length 
          : 0;

        return {
          date: format(new Date(date), 'dd/MM'),
          USD: Number(usdAvg.toFixed(4)),
          EUR: Number(eurAvg.toFixed(4)),
          fullDate: date
        };
      })
      .filter(item => item.USD > 0 || item.EUR > 0)
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-7);

    return result.map(({ date, USD, EUR }) => ({ date, USD, EUR }));
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const calculateYAxisDomain = () => {
    if (rateData.length === 0) return [3.5, 4.2];
    
    const allRates = rateData.flatMap(item => [item.USD, item.EUR]).filter(rate => rate > 0);
    if (allRates.length === 0) return [3.5, 4.2];
    
    const minRate = Math.min(...allRates);
    const maxRate = Math.max(...allRates);
    
    const margin = (maxRate - minRate) * 0.02;
    
    return [
      Number((minRate - margin).toFixed(3)),
      Number((maxRate + margin).toFixed(3))
    ];
  };

  const yAxisDomain = calculateYAxisDomain();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tendencias de Tipos de Cambio</CardTitle>
          <CardDescription>Promedio de tasas de cambio de los últimos días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Cargando tendencias...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Tendencias de Tipos de Cambio</CardTitle>
        <CardDescription>
          Promedio de tasas de cambio de los últimos {rateData.length} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {rateData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No hay datos de tipos de cambio para mostrar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rateData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={yAxisDomain}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `S/ ${value.toFixed(3)}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                  }}
                  formatter={(value: number) => [`S/ ${value.toFixed(4)}`, 'Tasa']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="USD" 
                  name="USD"
                  stroke="#85bb65" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="EUR" 
                  name="EUR"
                  stroke="#0A75BC" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Información adicional - ALINEADO CON EL DISEÑO */}
        {rateData.length > 0 && (
          <div className="mt-4 text-sm grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-xs">USD Actual</div>
              <div className="font-bold text-lg">S/ {rateData[rateData.length - 1]?.USD.toFixed(4)}</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-xs">EUR Actual</div>
              <div className="font-bold text-lg">S/ {rateData[rateData.length - 1]?.EUR.toFixed(4)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRateTrends;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ProfitabilityCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [operation, setOperation] = useState('buy');
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState(currency === 'USD' ? '3.65' : '4.00');
  const [projectedProfit, setProjectedProfit] = useState(0);
  
  // Datos de ejemplo para la predicción (en una app real, esto vendría de una API)
  const historicalRates = {
    USD: [3.62, 3.65, 3.68, 3.71, 3.73, 3.75, 3.77],
    EUR: [3.95, 4.00, 4.02, 4.05, 4.07, 4.09, 4.12]
  };
  
  // Calculamos el promedio del tipo de cambio en los últimos días
  const calculateAverageRate = (curr: 'USD' | 'EUR') => {
    const rates = historicalRates[curr];
    return rates.reduce((acc, rate) => acc + rate, 0) / rates.length;
  };
  
  // Calculamos la tendencia (si el tipo de cambio está subiendo o bajando)
  const calculateTrend = (curr: 'USD' | 'EUR') => {
    const rates = historicalRates[curr];
    const firstHalf = rates.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rates.slice(Math.floor(rates.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((acc, rate) => acc + rate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((acc, rate) => acc + rate, 0) / secondHalf.length;
    
    return secondHalfAvg - firstHalfAvg;
  };
  
  // Actualizamos la tasa cuando cambia la moneda
  useEffect(() => {
    setRate(currency === 'USD' ? '3.65' : '4.00');
  }, [currency]);
  
  // Calculamos la ganancia proyectada basada en datos históricos y tendencias
  useEffect(() => {
    const parsedAmount = parseFloat(amount) || 0;
    const parsedRate = parseFloat(rate) || 0;
    
    if (parsedAmount <= 0 || parsedRate <= 0) {
      setProjectedProfit(0);
      return;
    }
    
    // Obtenemos el promedio y la tendencia
    const avgRate = calculateAverageRate(currency as 'USD' | 'EUR');
    const trend = calculateTrend(currency as 'USD' | 'EUR');
    
    // Calculamos la ganancia según el tipo de operación
    let profit = 0;
    if (operation === 'buy') {
      // Compramos divisa ahora y la vendemos después (cuando suba)
      const projectedSellRate = parsedRate + (trend > 0 ? trend : 0);
      profit = parsedAmount * (projectedSellRate - parsedRate);
    } else {
      // Vendemos divisa ahora y la compramos después (cuando baje)
      const projectedBuyRate = parsedRate - (trend < 0 ? Math.abs(trend) : 0);
      profit = parsedAmount * (parsedRate - projectedBuyRate);
    }
    
    setProjectedProfit(profit);
  }, [amount, rate, currency, operation]);
  
  // Datos para el gráfico de predicción
  const profitPredictionData = [
    { name: 'Conservador', profit: projectedProfit * 0.5 },
    { name: 'Esperado', profit: projectedProfit },
    { name: 'Optimista', profit: projectedProfit * 1.5 }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-finance-secondary" />
          Calculadora de Rentabilidad
        </CardTitle>
        <CardDescription>
          Calcule y prevea la rentabilidad potencial de sus transacciones de divisas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="prediction">Predicción</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="operation">Tipo de Operación</Label>
                  <Select
                    value={operation}
                    onValueChange={(value) => setOperation(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar operación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Compra</SelectItem>
                      <SelectItem value="sell">Venta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="amount">Monto ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ingrese el monto"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="rate">Tasa de Cambio (S/ por {currency})</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="Ingrese la tasa"
                  />
                </div>
                
                <Button className="w-full mt-2">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Calcular Rentabilidad
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Resumen de Operación</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium capitalize">{operation === 'buy' ? 'Compra' : 'Venta'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moneda:</span>
                    <span className="font-medium">{currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-medium">{parseFloat(amount).toLocaleString('es-PE')} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de Cambio:</span>
                    <span className="font-medium">S/ {parseFloat(rate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equivalente en Soles:</span>
                    <span className="font-medium">
                      S/ {(parseFloat(amount) * parseFloat(rate)).toLocaleString('es-PE', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  <div className="pt-4 mt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ganancia Proyectada:</span>
                      <span className="text-xl font-bold text-finance-positive">
                        S/ {projectedProfit.toLocaleString('es-PE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Basado en el análisis de tendencias recientes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="prediction">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Este gráfico muestra la rentabilidad proyectada para su operación en diferentes escenarios.
              </p>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profitPredictionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `S/ ${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ganancia estimada']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="profit" 
                      name="Ganancia Proyectada" 
                      fill="#4CAF50" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Análisis de Tendencias</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Basado en datos históricos de los últimos 7 días para {currency}.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendencia actual:</span>
                    <span className={`font-medium ${calculateTrend(currency as 'USD' | 'EUR') > 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      {calculateTrend(currency as 'USD' | 'EUR') > 0 ? 'Al alza' : 'A la baja'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa promedio:</span>
                    <span className="font-medium">
                      S/ {calculateAverageRate(currency as 'USD' | 'EUR').toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variación:</span>
                    <span className={`font-medium ${calculateTrend(currency as 'USD' | 'EUR') > 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      {Math.abs(calculateTrend(currency as 'USD' | 'EUR')).toFixed(3)} puntos
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Recomendación:</h4>
                  {operation === 'buy' ? (
                    calculateTrend(currency as 'USD' | 'EUR') > 0 ? (
                      <p className="text-sm text-finance-positive">
                        <span className="font-bold">Favorable para comprar.</span> La tendencia al alza sugiere que el valor del {currency} podría aumentar, lo que podría resultar en ganancias al vender más adelante.
                      </p>
                    ) : (
                      <p className="text-sm text-finance-negative">
                        <span className="font-bold">Precaución al comprar.</span> La tendencia a la baja sugiere que el valor del {currency} podría seguir disminuyendo.
                      </p>
                    )
                  ) : (
                    calculateTrend(currency as 'USD' | 'EUR') < 0 ? (
                      <p className="text-sm text-finance-positive">
                        <span className="font-bold">Favorable para vender.</span> La tendencia a la baja sugiere que el valor del {currency} podría seguir disminuyendo, lo que podría resultar en ganancias al comprar más adelante a un precio menor.
                      </p>
                    ) : (
                      <p className="text-sm text-finance-negative">
                        <span className="font-bold">Precaución al vender.</span> La tendencia al alza sugiere que el valor del {currency} podría seguir aumentando.
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityCalculator;

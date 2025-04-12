
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Datos de ejemplo para el gráfico
const data = [
  { name: 'Ene', USD: 3.68, EUR: 4.02 },
  { name: 'Feb', USD: 3.71, EUR: 4.05 },
  { name: 'Mar', USD: 3.75, EUR: 4.09 },
  { name: 'Abr', USD: 3.65, EUR: 4.00 },
  { name: 'May', USD: 3.62, EUR: 3.95 },
  { name: 'Jun', USD: 3.70, EUR: 4.03 },
  { name: 'Jul', USD: 3.73, EUR: 4.07 },
];

const ExchangeRateTrends: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tendencias de Tipos de Cambio</CardTitle>
        <CardDescription>Seguimiento histórico de tipos de cambio USD y EUR</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[3.5, 4.2]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                formatter={(value: number) => [`S/ ${value.toFixed(2)}`, undefined]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="USD" 
                stroke="#85bb65" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="EUR" 
                stroke="#0A75BC" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateTrends;

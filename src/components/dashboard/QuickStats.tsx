
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, BarChart2, DollarSign, Euro } from 'lucide-react';

const QuickStats: React.FC = () => {
  const stats = [
    {
      title: 'Compra USD',
      value: 'S/ 3.65',
      change: '+0.05',
      icon: <DollarSign className="h-6 w-6 text-finance-usd" />,
      trend: 'up',
    },
    {
      title: 'Venta USD',
      value: 'S/ 3.75',
      change: '+0.03',
      icon: <DollarSign className="h-6 w-6 text-finance-usd" />,
      trend: 'up',
    },
    {
      title: 'Compra EUR',
      value: 'S/ 4.00',
      change: '-0.02',
      icon: <Euro className="h-6 w-6 text-finance-eur" />,
      trend: 'down',
    },
    {
      title: 'Venta EUR',
      value: 'S/ 4.10',
      change: '-0.01',
      icon: <Euro className="h-6 w-6 text-finance-eur" />,
      trend: 'down',
    },
  ];

  return (
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
                <ArrowUpIcon className="mr-1 h-4 w-4 text-finance-positive" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4 text-finance-negative" />
              )}
              <span className={`text-xs ${stat.trend === 'up' ? 'text-finance-positive' : 'text-finance-negative'}`}>
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;

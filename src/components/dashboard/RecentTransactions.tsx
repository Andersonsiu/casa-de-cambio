
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const transactions = [
  {
    id: 1,
    type: 'compra',
    currency: 'USD',
    amount: 500,
    rate: 3.65,
    total: 1825,
    date: '2023-06-15',
  },
  {
    id: 2,
    type: 'venta',
    currency: 'USD',
    amount: 300,
    rate: 3.75,
    total: 1125,
    date: '2023-06-14',
  },
  {
    id: 3,
    type: 'compra',
    currency: 'EUR',
    amount: 200,
    rate: 4.00,
    total: 800,
    date: '2023-06-13',
  },
  {
    id: 4,
    type: 'venta',
    currency: 'EUR',
    amount: 100,
    rate: 4.10,
    total: 410,
    date: '2023-06-12',
  },
];

const RecentTransactions: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Tasa</TableHead>
              <TableHead>Total (S/)</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center">
                    {transaction.type === 'compra' ? (
                      <ArrowDownLeft className="mr-2 h-4 w-4 text-finance-positive" />
                    ) : (
                      <ArrowUpRight className="mr-2 h-4 w-4 text-finance-negative" />
                    )}
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell>{transaction.currency}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>S/ {transaction.rate.toFixed(2)}</TableCell>
                <TableCell>S/ {transaction.total.toFixed(2)}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

const TransactionInterface: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nueva Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm />
        </CardContent>
      </Card>

      <TransactionList />
    </div>
  );
};

export default TransactionInterface;

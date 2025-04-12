
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TransactionForm from './TransactionForm';
import RecentTransactionsList from './RecentTransactionsList';
import TransactionHistory from './TransactionHistory';

interface Transaction {
  id: number;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  date: Date;
}

const TransactionInterface: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransactionSubmit = (transactionData: {
    type: 'compra' | 'venta';
    currency: 'USD' | 'EUR';
    amount: number;
    rate: number;
    date: Date;
  }) => {
    const { type, currency, amount, rate, date } = transactionData;
    const total = amount * rate;
    
    const newTransaction: Transaction = {
      id: Date.now(),
      type,
      currency,
      amount,
      rate,
      total,
      date
    };
    
    setTransactions([...transactions, newTransaction]);
    toast.success('Transacción registrada exitosamente');
  };
  
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('Transacción eliminada');
  };
  
  const clearAllTransactions = () => {
    setTransactions([]);
    toast.success('Todas las transacciones han sido eliminadas');
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Registrar Transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onTransactionSubmit={handleTransactionSubmit} />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transacciones Recientes</CardTitle>
            {transactions.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllTransactions}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Borrar Todo
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <RecentTransactionsList 
              transactions={transactions} 
              onDeleteTransaction={deleteTransaction}
            />
          </CardContent>
        </Card>
      </div>
      
      {transactions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historial Completo</CardTitle>
            <div className="text-sm text-gray-500">
              Total: {transactions.length} transacciones
            </div>
          </CardHeader>
          <CardContent>
            <TransactionHistory 
              transactions={transactions} 
              onDeleteTransaction={deleteTransaction}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionInterface;

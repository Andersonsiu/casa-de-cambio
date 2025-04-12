
import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';

interface Transaction {
  id: number;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  date: Date;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ 
  transactions, 
  onDeleteTransaction 
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No hay transacciones registradas
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Moneda</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Tasa</TableHead>
          <TableHead>Total (S/)</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.slice(-5).map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="capitalize">{transaction.type}</TableCell>
            <TableCell>{transaction.currency}</TableCell>
            <TableCell>{transaction.amount.toFixed(2)}</TableCell>
            <TableCell>S/ {transaction.rate.toFixed(2)}</TableCell>
            <TableCell>S/ {transaction.total.toFixed(2)}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteTransaction(transaction.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentTransactionsList;

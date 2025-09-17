
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

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  onDeleteTransaction 
}) => {
  if (transactions.length === 0) {
    return null;
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
          <TableHead>Fecha</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="capitalize">{transaction.type}</TableCell>
            <TableCell>{transaction.currency}</TableCell>
            <TableCell>{transaction.amount.toFixed(2)}</TableCell>
            <TableCell>S/ {transaction.rate.toFixed(2)}</TableCell>
            <TableCell>S/ {transaction.total.toFixed(2)}</TableCell>
            <TableCell>{format(transaction.date, 'dd/MM/yyyy')}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteTransaction(transaction.id)}
                className="hover:bg-finance-negative/10 hover:text-finance-negative transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TransactionHistory;

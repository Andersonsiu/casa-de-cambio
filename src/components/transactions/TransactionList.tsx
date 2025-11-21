import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import TransactionForm from './TransactionForm';

interface Transaction {
  id: string;
  dni: string;
  full_name: string;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  transaction_date: string;
  created_at: string;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { isAdmin } = useUserRole();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedData = (data || []).map(t => ({
        ...t,
        type: t.type as 'compra' | 'venta',
        currency: t.currency as 'USD' | 'EUR'
      }));
      setTransactions(typedData);
      setFilteredTransactions(typedData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(t =>
        t.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden eliminar transacciones');
      return;
    }

    if (!confirm('¿Está seguro de eliminar esta transacción?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Transacción eliminada');
      fetchTransactions();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar transacción');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Transacciones Recientes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay transacciones</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DNI</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Tasa</TableHead>
                    <TableHead>Total (S/)</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.dni}</TableCell>
                      <TableCell>{transaction.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'compra' ? 'default' : 'destructive'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.rate.toFixed(4)}</TableCell>
                      <TableCell className="font-medium">{transaction.total.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTransaction(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
            <DialogDescription>
              Modifique los detalles de la transacción
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={{
                id: editingTransaction.id,
                type: editingTransaction.type,
                currency: editingTransaction.currency,
                amount: editingTransaction.amount,
                rate: editingTransaction.rate,
                date: new Date(editingTransaction.transaction_date),
                dni: editingTransaction.dni,
                full_name: editingTransaction.full_name,
              }}
              onSuccess={() => {
                setEditingTransaction(null);
                fetchTransactions();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionList;

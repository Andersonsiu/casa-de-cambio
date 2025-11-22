// src/components/transactions/TransactionList.tsx
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
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { useUserRole } from '@/hooks/useUserRole';
import TransactionForm from './TransactionForm';

import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

interface Transaction {
  id: string;
  dni: string;
  full_name: string;
  type: 'compra' | 'venta';
  currency: 'USD' | 'EUR';
  amount: number;
  rate: number;
  total: number;
  transaction_date: string; // Formato: "2025-11-20"
  created_at: string;       // ISO string
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
      const ref = collection(db, 'transactions');
      const q = query(ref, orderBy('created_at', 'desc'));
      const snap = await getDocs(q);

      const typedData: Transaction[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          dni: data.dni,
          full_name: data.full_name,
          type: data.type as 'compra' | 'venta',
          currency: data.currency as 'USD' | 'EUR',
          amount: Number(data.amount),
          rate: Number(data.rate),
          total: Number(data.total),
          transaction_date: data.transaction_date,
          created_at: data.created_at,
        };
      });

      setTransactions(typedData);
      setFilteredTransactions(typedData);
    } catch (error) {
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
      const term = searchTerm.toLowerCase();
      const filtered = transactions.filter((t) =>
        t.dni.toLowerCase().includes(term) ||
        t.full_name.toLowerCase().includes(term) ||
        t.type.toLowerCase().includes(term) ||
        t.currency.toLowerCase().includes(term)
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
      await deleteDoc(doc(db, 'transactions', id));
      toast.success('Transacción eliminada');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar transacción');
    }
  };

  // Función para convertir transaction_date string a Date
  const parseTransactionDate = (dateString: string): Date => {
    // Si la fecha está en formato "2025-11-20", la convertimos a Date
    if (dateString && dateString.includes('-')) {
      return parseISO(dateString);
    }
    // Si es una fecha ISO, usar parseISO directamente
    return new Date(dateString);
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
            <div className="text-center py-8 text-muted-foreground">
              Cargando...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay transacciones
            </div>
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
                      <TableCell className="font-medium">
                        {transaction.dni}
                      </TableCell>
                      <TableCell>{transaction.full_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === 'compra'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.currency}</TableCell>
                      <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.rate.toFixed(4)}</TableCell>
                      <TableCell className="font-medium">
                        {transaction.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_date
                          ? format(
                              parseTransactionDate(transaction.transaction_date),
                              'dd/MM/yyyy'
                            )
                          : '-'}
                      </TableCell>
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

      <Dialog
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
      >
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
                date: parseTransactionDate(editingTransaction.transaction_date),
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Firebase
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentData } from 'firebase/firestore';

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

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const transactionsPerPage = 4;

  const fetchRecentTransactions = async (isNextPage: boolean = false) => {
    setLoading(true);
    try {
      const transactionsRef = collection(db, 'transactions');
      
      let q;
      if (isNextPage && lastVisible) {
        q = query(
          transactionsRef, 
          orderBy('created_at', 'desc'), 
          startAfter(lastVisible),
          limit(transactionsPerPage + 1)
        );
      } else {
        q = query(
          transactionsRef, 
          orderBy('created_at', 'desc'), 
          limit(transactionsPerPage + 1)
        );
      }

      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Transaction)
      })) as Transaction[];

      const hasMore = transactionsData.length > transactionsPerPage;
      const transactionsToShow = hasMore 
        ? transactionsData.slice(0, transactionsPerPage)
        : transactionsData;

      setTransactions(transactionsToShow);
      setHasNextPage(hasMore);
      
      if (transactionsToShow.length > 0) {
        const lastDoc = querySnapshot.docs[transactionsToShow.length - 1];
        setLastVisible(lastDoc);
      }

      if (!isNextPage) {
        setCurrentPage(1);
      }

    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      toast.error('Error al cargar transacciones recientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousPage = async () => {
    await fetchRecentTransactions(false);
    setCurrentPage(1);
  };

  const fetchNextPage = async () => {
    await fetchRecentTransactions(true);
    setCurrentPage(prev => prev + 1);
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando transacciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay transacciones recientes
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Moneda</TableHead>
                  <TableHead className="font-semibold">Monto</TableHead>
                  <TableHead className="font-semibold">Tasa</TableHead>
                  <TableHead className="font-semibold">Total (S/)</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-b hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {transaction.full_name || 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          DN: {transaction.dni || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.type === 'compra' ? (
                          <ArrowDownLeft className="mr-2 h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="mr-2 h-4 w-4 text-red-600" />
                        )}
                        <span className="capitalize font-medium text-sm">
                          {transaction.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{transaction.currency}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">
                        {transaction.currency === 'USD' ? '$' : '€'}{transaction.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        S/ {transaction.rate.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm text-green-600">
                        S/ {transaction.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {transaction.transaction_date 
                          ? format(new Date(transaction.transaction_date), 'dd/MM')
                          : 'N/A'
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginación - MEJOR ALINEADA */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {currentPage}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPreviousPage}
                  disabled={currentPage === 1 || loading}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNextPage}
                  disabled={!hasNextPage || loading}
                  className="h-8 px-3"
                >
                  Siguiente
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Cargando...</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
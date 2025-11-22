import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  itemsPerPage?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  onDeleteTransaction,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular el total de páginas
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Obtener transacciones para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Manejar cambio de página
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Moneda</TableHead>
              <TableHead className="font-semibold">Monto</TableHead>
              <TableHead className="font-semibold">Tasa</TableHead>
              <TableHead className="font-semibold">Total (S/)</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="capitalize font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'compra' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {transaction.type}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{transaction.currency}</TableCell>
                <TableCell>
                  {transaction.currency === 'USD' ? '$' : '€'}{transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  S/ {transaction.rate.toFixed(4)}
                </TableCell>
                <TableCell className="font-semibold">
                  S/ {transaction.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(transaction.date, 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación - Solo se muestra si hay más de una página */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, transactions.length)} de {transactions.length} transacciones
          </div>
          
          <div className="flex items-center gap-1">
            {/* Botón Anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Números de página */}
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="h-8 w-8 p-0 text-xs"
              >
                {page}
              </Button>
            ))}

            {/* Botón Siguiente */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
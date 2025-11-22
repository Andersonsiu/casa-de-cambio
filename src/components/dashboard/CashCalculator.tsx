import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Calculator, DollarSign, Euro, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

interface CashCalculation {
  initialCashUSD: number;
  initialCashEUR: number;
  expenses: number;
  finalCashUSD: number;
  finalCashEUR: number;
  profitUSD: number;
  profitEUR: number;
  profitSoles: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  rate: number;
  transaction_date: string;
  created_at: string;
  dni: string;
  full_name: string;
  total: number;
  user_id: string;
}

const CashCalculator: React.FC = () => {
  const [initialCashUSD, setInitialCashUSD] = useState<string>('0.00');
  const [initialCashEUR, setInitialCashEUR] = useState<string>('0.00');
  const [expenses, setExpenses] = useState<string>('0.00');
  const [results, setResults] = useState<CashCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Validación de fechas
  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;
  const dateError = !isDateRangeValid ? "La fecha fin no puede ser menor a la fecha inicio" : "";

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isDateRangeValid) return;
      
      setLoading(true);
      try {
        const transactionsRef = collection(db, 'transactions');
        const querySnapshot = await getDocs(transactionsRef);
        const allTransactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];

        // Filtrar por transaction_date (string) en el cliente
        const filteredTransactions = allTransactions.filter(transaction => {
          const transactionDate = transaction.transaction_date;
          
          if (!startDate && !endDate) return true;
          if (startDate && !endDate) return transactionDate >= startDate;
          if (!startDate && endDate) return transactionDate <= endDate;
          if (startDate && endDate) return transactionDate >= startDate && transactionDate <= endDate;
          
          return true;
        });

        setTransactions(filteredTransactions);
        calculateInitialBalances(filteredTransactions);
        
      } catch (error) {
        console.error('Error al cargar transacciones:', error);
        toast.error('Error al cargar las transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, isDateRangeValid]);

  const calculateInitialBalances = (transactions: Transaction[]) => {
    let totalUSD = 0;
    let totalEUR = 0;

    transactions.forEach(transaction => {
      const transactionAmount = parseFloat(transaction.amount.toString());
      const transactionType = transaction.type;
      const transactionCurrency = transaction.currency;

      if (transactionCurrency === 'USD') {
        if (transactionType === 'compra') {
          totalUSD += transactionAmount;
        } else if (transactionType === 'venta') {
          totalUSD -= transactionAmount;
        }
      } else if (transactionCurrency === 'EUR') {
        if (transactionType === 'compra') {
          totalEUR += transactionAmount;
        } else if (transactionType === 'venta') {
          totalEUR -= transactionAmount;
        }
      }
    });

    setInitialCashUSD(totalUSD.toFixed(2));
    setInitialCashEUR(totalEUR.toFixed(2));
  };

  const calculateCash = async () => {
    if (!expenses) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (!isDateRangeValid) {
      toast.error('Corrija el rango de fechas antes de calcular');
      return;
    }

    setLoading(true);

    try {
      const expensesAmount = parseFloat(expenses);
      let totalUSD = parseFloat(initialCashUSD);
      let totalEUR = parseFloat(initialCashEUR);

      // Tasas de cambio realistas
      const tasaCompraUSD = 3.75;   // Precio al que compramos USD
      const tasaVentaUSD = 3.78;    // Precio al que vendemos USD
      const tasaCompraEUR = 4.10;   // Precio al que compramos EUR
      const tasaVentaEUR = 4.15;    // Precio al que vendemos EUR

      // Margen de ganancia por unidad
      const margenUSD = tasaVentaUSD - tasaCompraUSD;
      const margenEUR = tasaVentaEUR - tasaCompraEUR;

      // Ganancia potencial si vendemos todo el stock actual
      const gananciaPotencialUSD = totalUSD * margenUSD;
      const gananciaPotencialEUR = totalEUR * margenEUR;

      // Distribuir gastos proporcionalmente
      const totalStock = totalUSD + totalEUR;
      const gastosUSD = totalStock > 0 ? (totalUSD / totalStock) * expensesAmount : 0;
      const gastosEUR = totalStock > 0 ? (totalEUR / totalStock) * expensesAmount : 0;

      // Ganancia neta por moneda
      const gananciaNetaUSD = gananciaPotencialUSD - gastosUSD;
      const gananciaNetaEUR = gananciaPotencialEUR - gastosEUR;
      const gananciaTotalSoles = gananciaNetaUSD + gananciaNetaEUR;

      // Efectivo final (stock actual + ganancia convertida)
      const efectivoFinalUSD = totalUSD + (gananciaNetaUSD / tasaVentaUSD);
      const efectivoFinalEUR = totalEUR + (gananciaNetaEUR / tasaVentaEUR);

      const calculation: CashCalculation = {
        initialCashUSD: totalUSD,
        initialCashEUR: totalEUR,
        expenses: expensesAmount,
        finalCashUSD: efectivoFinalUSD,
        finalCashEUR: efectivoFinalEUR,
        profitUSD: gananciaNetaUSD,
        profitEUR: gananciaNetaEUR,
        profitSoles: gananciaTotalSoles,
      };

      setResults(calculation);
      toast.success('Cálculo de caja realizado exitosamente');
    } catch (error) {
      toast.error('Error al realizar el cálculo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6 text-accent" />
            Calculadora de Caja - Análisis de Rentabilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial-usd" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-finance-usd" />
                Stock Actual USD
              </Label>
              <Input
                id="initial-usd"
                type="number"
                step="0.01"
                value={initialCashUSD}
                disabled
                className="transition-all duration-200 focus:border-finance-usd bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Stock de dólares disponible</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-eur" className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-finance-eur" />
                Stock Actual EUR
              </Label>
              <Input
                id="initial-eur"
                type="number"
                step="0.01"
                value={initialCashEUR}
                disabled
                className="transition-all duration-200 focus:border-finance-eur bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Stock de euros disponible</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Gastos Operativos (S/)
              </Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="transition-all duration-200 focus:border-accent"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">Gastos del período</p>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={!isDateRangeValid ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={!isDateRangeValid ? "border-destructive" : ""}
              />
            </div>
          </div>

          {dateError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{dateError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Transacciones encontradas</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{transactions.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-blue-800">Período seleccionado</div>
              <div className="text-sm text-blue-700">
                {startDate || 'Inicio'} - {endDate || 'Fin'}
              </div>
            </div>
          </div>

          <EnhancedButton 
            onClick={calculateCash} 
            loading={loading}
            disabled={!isDateRangeValid || transactions.length === 0}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            size="lg"
          >
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? 'Calculando...' : 'Calcular Rentabilidad'}
          </EnhancedButton>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Resultados del Análisis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <Card className="border-0 shadow-soft bg-gradient-to-br from-finance-usd/10 to-finance-usd/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-finance-usd" />
                  Análisis USD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock Inicial:</span>
                    <span className="font-medium">${results.initialCashUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock Final:</span>
                    <span className="font-medium">${results.finalCashUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-medium">Ganancia Neta:</span>
                    <span className={`font-bold ${results.profitUSD >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      S/ {results.profitUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground p-2 bg-white/50 rounded">
                  Basado en margen: Compra S/ 3.75 - Venta S/ 3.78
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft bg-gradient-to-br from-finance-eur/10 to-finance-eur/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="h-5 w-5 text-finance-eur" />
                  Análisis EUR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock Inicial:</span>
                    <span className="font-medium">€{results.initialCashEUR.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock Final:</span>
                    <span className="font-medium">€{results.finalCashEUR.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-medium">Ganancia Neta:</span>
                    <span className={`font-bold ${results.profitEUR >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      S/ {results.profitEUR.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground p-2 bg-white/50 rounded">
                  Basado en margen: Compra S/ 4.10 - Venta S/ 4.15
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Resumen Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gastos Operativos:</span>
                    <span className="font-medium text-muted-foreground">S/ {results.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm font-medium">Ganancia Total:</span>
                    <span className={`text-xl font-bold ${results.profitSoles >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                      S/ {results.profitSoles.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground p-2 bg-white/50 rounded">
                  {results.profitSoles >= 0 ? '✅ Operación rentable' : '⚠️ Operación no rentable'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashCalculator;
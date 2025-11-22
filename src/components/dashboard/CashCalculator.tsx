import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Calculator, DollarSign, Euro, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth } from '@/integrations/firebase/client';

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

const CashCalculator: React.FC = () => {
  const [initialCashUSD, setInitialCashUSD] = useState<string>('0.00');
  const [initialCashEUR, setInitialCashEUR] = useState<string>('0.00');
  const [expenses, setExpenses] = useState<string>('0.00');
  const [results, setResults] = useState<CashCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const userUID = auth.currentUser?.uid;

  useEffect(() => {
    if (!userUID) return; // Si no hay un usuario autenticado, no hacemos la consulta

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const transactionsRef = collection(db, 'transactions');
        let q = query(
          transactionsRef,
          where('user_id', '==', userUID)
        );

        // Si se ha seleccionado un rango de fechas, lo aplicamos en la consulta
        if (startDate) {
          const startTimestamp = Timestamp.fromDate(new Date(startDate));
          q = query(q, where('transaction_date', '>=', startTimestamp));
        }
        if (endDate) {
          const endTimestamp = Timestamp.fromDate(new Date(endDate));
          q = query(q, where('transaction_date', '<=', endTimestamp));
        }

        const querySnapshot = await getDocs(q);
        const transactionData = querySnapshot.docs.map(doc => doc.data());
        setTransactions(transactionData);
        calculateInitialBalances(transactionData);
      } catch (error) {
        toast.error('Error al cargar las transacciones');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userUID, startDate, endDate]);

  const calculateInitialBalances = (transactions: any[]) => {
    let totalUSD = 0;
    let totalEUR = 0;

    transactions.forEach(transaction => {
      const transactionAmount = parseFloat(transaction.amount);
      const transactionRate = parseFloat(transaction.rate);
      const transactionType = transaction.type;
      const transactionCurrency = transaction.currency;

      if (transactionCurrency === 'USD') {
        if (transactionType === 'compra') {
          totalUSD += transactionAmount * transactionRate;
        } else if (transactionType === 'venta') {
          totalUSD -= transactionAmount * transactionRate;
        }
      } else if (transactionCurrency === 'EUR') {
        if (transactionType === 'compra') {
          totalEUR += transactionAmount * transactionRate;
        } else if (transactionType === 'venta') {
          totalEUR -= transactionAmount * transactionRate;
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

    setLoading(true);

    try {
      const expensesAmount = parseFloat(expenses);
      let totalUSD = parseFloat(initialCashUSD);
      let totalEUR = parseFloat(initialCashEUR);

      const mockBuyMarginUSD = 3.75;
      const mockSellMarginUSD = 3.78;
      const mockBuyMarginEUR = 4.10;
      const mockSellMarginEUR = 4.15;

      const marginDifferenceUSD = mockSellMarginUSD - mockBuyMarginUSD;
      const marginDifferenceEUR = mockSellMarginEUR - mockBuyMarginEUR;

      const profitSolesUSD = (totalUSD * marginDifferenceUSD) - expensesAmount;
      const profitSolesEUR = (totalEUR * marginDifferenceEUR) - expensesAmount;

      const profitSoles = profitSolesUSD + profitSolesEUR;

      const calculation: CashCalculation = {
        initialCashUSD: totalUSD,
        initialCashEUR: totalEUR,
        expenses: expensesAmount,
        finalCashUSD: totalUSD + profitSolesUSD / mockSellMarginUSD,
        finalCashEUR: totalEUR + profitSolesEUR / mockSellMarginEUR,
        profitUSD: profitSolesUSD,
        profitEUR: profitSolesEUR,
        profitSoles,
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
            Calculadora de Caja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial-usd">Saldo USD</Label>
              <Input
                id="initial-usd"
                type="number"
                step="0.01"
                value={initialCashUSD}
                disabled
                className="transition-all duration-200 focus:border-finance-usd"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-eur">Saldo EUR</Label>
              <Input
                id="initial-eur"
                type="number"
                step="0.01"
                value={initialCashEUR}
                disabled
                className="transition-all duration-200 focus:border-finance-eur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenses">Gastos (S/)</Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="transition-all duration-200 focus:border-accent"
              />
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="space-y-2 mt-4">
            <Label>Fecha de Inicio</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Label>Fecha de Fin</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <EnhancedButton 
            onClick={calculateCash} 
            loading={loading}
            className="w-full bg-blue-500 text-white hover:bg-blue-700 transition-all duration-200"
            size="lg"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Caja
          </EnhancedButton>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="border-0 shadow-soft bg-gradient-to-br from-finance-usd/10 to-finance-usd/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-finance-usd" />
                USD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Inicial:</span>
                <span className="font-medium">${results.initialCashUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Final:</span>
                <span className="font-medium">${results.finalCashUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Ganancia:</span>
                <span className={`font-bold ${results.profitUSD >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                  ${results.profitUSD.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft bg-gradient-to-br from-finance-eur/10 to-finance-eur/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Euro className="h-5 w-5 text-finance-eur" />
                EUR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Inicial:</span>
                <span className="font-medium">€{results.initialCashEUR.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Final:</span>
                <span className="font-medium">€{results.finalCashEUR.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Ganancia:</span>
                <span className={`font-bold ${results.profitEUR >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                  €{results.profitEUR.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Total Soles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gastos:</span>
                <span className="font-medium">S/ {results.expenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Ganancia Total:</span>
                <span className={`text-xl font-bold ${results.profitSoles >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
                  S/ {results.profitSoles.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CashCalculator;

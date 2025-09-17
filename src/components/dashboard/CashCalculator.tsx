import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Calculator, DollarSign, Euro, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

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
  const [initialCashUSD, setInitialCashUSD] = useState<string>('');
  const [initialCashEUR, setInitialCashEUR] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [results, setResults] = useState<CashCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateCash = async () => {
    if (!initialCashUSD || !initialCashEUR || !expenses) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      // Simulated calculation - In a real app, this would come from transaction data
      const initialUSD = parseFloat(initialCashUSD);
      const initialEUR = parseFloat(initialCashEUR);
      const expensesAmount = parseFloat(expenses);
      
      // Mock calculations based on the Python logic
      const mockBuyMarginUSD = 3.75;
      const mockSellMarginUSD = 3.78;
      const mockBuyMarginEUR = 4.10;
      const mockSellMarginEUR = 4.15;
      
      const marginDifferenceUSD = mockSellMarginUSD - mockBuyMarginUSD;
      const marginDifferenceEUR = mockSellMarginEUR - mockBuyMarginEUR;
      
      const profitSolesUSD = (initialUSD * marginDifferenceUSD) - expensesAmount;
      const profitSolesEUR = (initialEUR * marginDifferenceEUR) - expensesAmount;
      
      const profitUSD = profitSolesUSD / mockSellMarginUSD;
      const profitEUR = profitSolesEUR / mockSellMarginEUR;
      
      const finalUSD = initialUSD + profitUSD;
      const finalEUR = initialEUR + profitEUR;
      
      const calculation: CashCalculation = {
        initialCashUSD: initialUSD,
        initialCashEUR: initialEUR,
        expenses: expensesAmount,
        finalCashUSD: finalUSD,
        finalCashEUR: finalEUR,
        profitUSD,
        profitEUR,
        profitSoles: profitSolesUSD + profitSolesEUR
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
              <Label htmlFor="initial-usd" className="text-sm font-medium">
                Caja Inicial USD
              </Label>
              <Input
                id="initial-usd"
                type="number"
                step="0.01"
                value={initialCashUSD}
                onChange={(e) => setInitialCashUSD(e.target.value)}
                placeholder="0.00"
                className="transition-all duration-200 focus:border-finance-usd"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initial-eur" className="text-sm font-medium">
                Caja Inicial EUR
              </Label>
              <Input
                id="initial-eur"
                type="number"
                step="0.01"
                value={initialCashEUR}
                onChange={(e) => setInitialCashEUR(e.target.value)}
                placeholder="0.00"
                className="transition-all duration-200 focus:border-finance-eur"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expenses" className="text-sm font-medium">
                Gastos (S/)
              </Label>
              <Input
                id="expenses"
                type="number"
                step="0.01"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="0.00"
                className="transition-all duration-200 focus:border-accent"
              />
            </div>
          </div>
          
          <EnhancedButton 
            onClick={calculateCash} 
            loading={loading}
            className="w-full"
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
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import CashCalculator from '@/components/dashboard/CashCalculator';
import ProfitabilityCalculator from '@/components/profitability/ProfitabilityCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Transactions: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
        </div>

        <Tabs defaultValue="register" className="w-full">
          {/* Centrar TabsList */}
          <TabsList className="grid w-full grid-cols-3 mx-auto justify-center">
            <TabsTrigger value="register">Registrar</TabsTrigger>
            <TabsTrigger value="recent">Recientes</TabsTrigger>
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nueva Transacción</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <TransactionList />
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <CashCalculator />
          </TabsContent>

          <TabsContent value="profitability" className="mt-6">
            <ProfitabilityCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Transactions;

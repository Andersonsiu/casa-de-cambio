
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import QuickStats from '@/components/dashboard/QuickStats';
import ExchangeRateTrends from '@/components/dashboard/ExchangeRateTrends';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ExchangeRateHistory from '@/components/dashboard/ExchangeRateHistory';
import ProfitabilityCalculator from '@/components/profitability/ProfitabilityCalculator';
import CashCalculator from '@/components/dashboard/CashCalculator';

const Index = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Gestión completa de casa de cambios</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Hoy</div>
          <div className="font-medium text-foreground">
            {new Date().toLocaleDateString('es-PE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <QuickStats />
      </div>
      
      <div className="mb-8">
        <ExchangeRateHistory />
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        <ExchangeRateTrends />
        <RecentTransactions />
      </div>
      
      <div className="mb-8">
        <CashCalculator />
      </div>
      
      <div className="mb-8">
        <ProfitabilityCalculator />
      </div>
    </MainLayout>
  );
};

export default Index;

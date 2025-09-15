
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import QuickStats from '@/components/dashboard/QuickStats';
import ExchangeRateTrends from '@/components/dashboard/ExchangeRateTrends';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ExchangeRateHistory from '@/components/dashboard/ExchangeRateHistory';
import ProfitabilityCalculator from '@/components/profitability/ProfitabilityCalculator';

const Index = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="mb-6">
        <QuickStats />
      </div>
      
      <div className="mb-6">
        <ExchangeRateHistory />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <ExchangeRateTrends />
        <RecentTransactions />
      </div>
      
      <div className="mb-6">
        <ProfitabilityCalculator />
      </div>
    </MainLayout>
  );
};

export default Index;

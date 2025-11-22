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
      {/* Hero Section with Clean Background */}
      <div className="relative overflow-hidden rounded-2xl bg-finance-secondary p-8 mb-8 border border-finance-primary/20 shadow-card">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-finance-primary rounded-xl flex items-center justify-center shadow-soft">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-finance-primary">
                  Rojas - Casa de cambio
                </h1>
                <p className="text-muted-foreground text-lg">Centro de control financiero avanzado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-finance-positive rounded-full" />
                <span className="text-foreground font-medium">Sistema Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-finance-primary rounded-full" />
                <span className="text-foreground font-medium">Tiempo Real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-finance-tertiary rounded-full" />
                <span className="text-foreground font-medium">Seguro</span>
              </div>
            </div>
          </div>
          
          <div className="text-right bg-white rounded-xl p-6 border border-finance-primary/10 shadow-soft">
            <div className="text-sm text-muted-foreground mb-1">Fecha Actual</div>
            <div className="font-bold text-foreground text-lg">
              {new Date().toLocaleDateString('es-PE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs text-finance-primary mt-2 font-medium">
              {new Date().toLocaleTimeString('es-PE', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <QuickStats />
      </div>
      
      {/* Exchange Rate History with Clean Design */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="bg-white rounded-2xl p-6 border border-finance-primary/10 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-finance-tertiary rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Historial de Tipos de Cambio</h2>
                <p className="text-sm text-muted-foreground">Seguimiento en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-finance-positive/10 rounded-lg border border-finance-positive/20">
              <div className="w-2 h-2 bg-finance-positive rounded-full" />
              <span className="text-xs font-medium text-finance-positive">En Vivo</span>
            </div>
          </div>
          <ExchangeRateHistory />
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="bg-white rounded-2xl p-6 border border-finance-primary/20 shadow-card h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-finance-primary/10 rounded-lg flex items-center justify-center border border-finance-primary/20">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Tendencias de Mercado</h2>
                <p className="text-sm text-muted-foreground">Análisis avanzado</p>
              </div>
            </div>
            <ExchangeRateTrends />
          </div>
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="bg-white rounded-2xl p-6 border border-finance-tertiary/20 shadow-card h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-finance-tertiary/10 rounded-lg flex items-center justify-center border border-finance-tertiary/20">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Transacciones Recientes</h2>
                <p className="text-sm text-muted-foreground">Actividad más reciente</p>
              </div>
            </div>
            <RecentTransactions />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
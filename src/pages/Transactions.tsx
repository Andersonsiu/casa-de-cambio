
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TransactionInterface from '@/components/transactions/TransactionInterface';

const Transactions: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <TransactionInterface />
    </MainLayout>
  );
};

export default Transactions;

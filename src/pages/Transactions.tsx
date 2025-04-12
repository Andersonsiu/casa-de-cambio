
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TransactionInterface from '@/components/transactions/TransactionInterface';
import TransactionPageHeader from '@/components/transactions/TransactionPageHeader';

const Transactions: React.FC = () => {
  return (
    <MainLayout>
      <TransactionPageHeader />
      <TransactionInterface />
    </MainLayout>
  );
};

export default Transactions;

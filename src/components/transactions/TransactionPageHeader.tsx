
import React from 'react';

const TransactionPageHeader: React.FC = () => {
  return (
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
  );
};

export default TransactionPageHeader;

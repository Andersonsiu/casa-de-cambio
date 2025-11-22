// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { AppRole } from '@/types/firestoreTypes';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { firebaseUser, role, active, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-finance-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-finance-primary" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/auth" replace />;
  }

  if (active === false) {
    return (
      <div className="min-h-screen bg-finance-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="font-semibold text-lg">
            Tu usuario ha sido desactivado.
          </p>
          <p className="text-sm text-muted-foreground">
            Comunícate con un administrador de Rojas - Casa de cambio para reactivar tu
            acceso.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

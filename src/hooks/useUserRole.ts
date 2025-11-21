// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { getUserByUid } from '@/services/firestore';
import type { AppRole } from '@/types/firestore';

export type UserRole = AppRole | null;

export const useUserRole = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setRole(null);
        setActive(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserByUid(user.uid);
        if (profile) {
          setRole(profile.role);
          setActive(profile.active);
        } else {
          // si no hay perfil, lo tratamos como operador activo por defecto
          setRole('operator');
          setActive(true);
        }
      } catch (e) {
        console.error(e);
        setRole('operator');
        setActive(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return {
    firebaseUser,
    role,
    active,
    loading,
    isAdmin: role === 'admin',
    isOperator: role === 'operator',
  };
};

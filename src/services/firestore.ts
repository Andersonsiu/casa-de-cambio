import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import type { AppUser } from '@/types/firestore';

const usersCollection = collection(db, 'users');

// Lista todos los usuarios (para UserManagement)
export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCollection);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AppUser, 'id'>),
  }));
}

// Crea/actualiza perfil de usuario usando uid como id del doc
export async function createUserProfile(
  uid: string,
  data: Omit<AppUser, 'id'>
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data);
}

export async function updateUserProfile(
  uid: string,
  data: Partial<AppUser>
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, data as any);
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  await deleteDoc(ref);
}

// Usado por ProtectedRoute y MainLayout
export async function getUserByUid(uid: string): Promise<AppUser | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<AppUser, 'id'>) };
}

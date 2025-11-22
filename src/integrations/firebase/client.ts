// src/integrations/firebase/client.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ================ App principal (frontend normal) =================

// Evita inicializar dos veces en hot-reload
const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore y Auth principal (el que usa el usuario logueado)
export const db = getFirestore(app);
export const auth = getAuth(app);

// ================ App secundaria para gestión de usuarios =================

// Segunda instancia SOLO para crear/administrar usuarios
// Así no afecta al usuario logueado en `auth`.
const managementApp =
  getApps().find((a) => a.name === 'management') ||
  initializeApp(firebaseConfig, 'management');

export const managementAuth = getAuth(managementApp);

export { app };

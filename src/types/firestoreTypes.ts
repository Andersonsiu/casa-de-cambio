
export type AppRole = 'admin' | 'operator';

export interface AppUser {
  id: string;       // uid de Firebase Auth
  name: string;
  email: string;
  role: AppRole;
  active: boolean;
  createdAt?: string;
}

// src/components/settings/UserManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, User, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { AppRole, AppUser } from '@/types/firestoreTypes';
import {
  listUsers,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '@/services/firestore';

// ✅ YA NO IMPORTAMOS `auth` NI `createUserWithEmailAndPassword`
// import { auth } from '@/integrations/firebase/client';
// import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: AppRole;
    password: string;
  }>({
    name: '',
    email: '',
    role: 'operator',
    password: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔥 Helper para crear usuario en Firebase Auth SIN tocar la sesión actual
  const signUpUserInFirebaseAuth = async (
    email: string,
    password: string
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Falta VITE_FIREBASE_API_KEY en el .env');
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: false, // no necesitamos idToken, solo crear la cuenta
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Firebase signUp error:', errorData);
      throw new Error(errorData.error?.message || 'Error al crear usuario en Auth');
    }

    const data = await res.json();
    // `localId` es el uid del usuario nuevo
    return data.localId as string;
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (!newUser.email.includes('@')) {
      toast.error('Correo electrónico inválido');
      return;
    }

    try {
      // 1️⃣ Crear usuario en Firebase Auth vía REST (NO toca tu sesión actual)
      const uid = await signUpUserInFirebaseAuth(
        newUser.email,
        newUser.password
      );

      // 2️⃣ Crear perfil en Firestore
      await createUserProfile(uid, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: true,
        createdAt: new Date().toISOString(),
      });

      const newUserObj: AppUser = {
        id: uid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: true,
      };

      setUsers((prev) => [...prev, newUserObj]);

      setNewUser({
        name: '',
        email: '',
        role: 'operator',
        password: '',
      });

      toast.success('Usuario creado en Auth y Firestore sin cerrar tu sesión');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Error al crear usuario');
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const newActive = !user.active;

    try {
      await updateUserProfile(id, { active: newActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: newActive } : u))
      );
      toast.success('Estado del usuario actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar usuario');
    }
  };

  const removeUser = async (id: string) => {
    try {
      // Desde el frontend solo eliminamos el perfil de Firestore.
      // Para borrar también de Auth se necesita Admin SDK / Cloud Function.
      await deleteUserProfile(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuario eliminado (perfil)');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar usuario');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nuevo Usuario</CardTitle>
          <CardDescription>
            Crea el usuario en Firebase Auth y asigna su rol en Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="Nombre del usuario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value as AppRole })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccione rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña inicial</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Contraseña"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={addUser} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Usuario
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Administre los usuarios que tienen acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-finance-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              No hay usuarios registrados aún.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <User className="mr-1 h-3 w-3" />
                          Operador
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.active}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

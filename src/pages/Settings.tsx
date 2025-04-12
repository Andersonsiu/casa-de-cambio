
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, Euro, User, Users, Bell, Shield, 
  Trash2, Lock, Save, Plus 
} from 'lucide-react';
import { toast } from 'sonner';

interface ExchangeRate {
  id: number;
  currency: 'USD' | 'EUR';
  buyRate: number;
  sellRate: number;
  lastUpdated: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  active: boolean;
}

const Settings: React.FC = () => {
  const [defaultRates, setDefaultRates] = useState<ExchangeRate[]>([
    {
      id: 1,
      currency: 'USD',
      buyRate: 3.65,
      sellRate: 3.75,
      lastUpdated: new Date()
    },
    {
      id: 2,
      currency: 'EUR',
      buyRate: 4.00,
      sellRate: 4.10,
      lastUpdated: new Date()
    }
  ]);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Admin Principal',
      email: 'admin@forexpro.com',
      role: 'admin',
      active: true
    },
    {
      id: 2,
      name: 'Operador 1',
      email: 'operador1@forexpro.com',
      role: 'operator',
      active: true
    }
  ]);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'operator',
    password: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    rateChanges: true,
    dailyReports: false
  });
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30'
  });
  
  const updateRate = (id: number, field: 'buyRate' | 'sellRate', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setDefaultRates(rates => rates.map(rate => 
      rate.id === id 
        ? { ...rate, [field]: numValue, lastUpdated: new Date() } 
        : rate
    ));
    
    toast.success('Tasa de cambio actualizada');
  };
  
  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    
    if (!newUser.email.includes('@')) {
      toast.error('Correo electrónico inválido');
      return;
    }
    
    const newUserObj: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'admin' | 'operator',
      active: true
    };
    
    setUsers([...users, newUserObj]);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'operator',
      password: ''
    });
    
    toast.success('Usuario agregado exitosamente');
  };
  
  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, active: !user.active } 
        : user
    ));
    
    toast.success('Estado del usuario actualizado');
  };
  
  const deleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success('Usuario eliminado');
  };
  
  const saveNotificationSettings = () => {
    toast.success('Configuración de notificaciones guardada');
  };
  
  const saveSecuritySettings = () => {
    toast.success('Configuración de seguridad guardada');
  };
  
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-PE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <Tabs defaultValue="exchange-rates" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="exchange-rates">Tasas de Cambio</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exchange-rates">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Tasas de Cambio</CardTitle>
              <CardDescription>
                Configure las tasas de cambio predeterminadas para las operaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moneda</TableHead>
                    <TableHead>Tasa de Compra (S/)</TableHead>
                    <TableHead>Tasa de Venta (S/)</TableHead>
                    <TableHead>Última Actualización</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defaultRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="flex items-center">
                        {rate.currency === 'USD' ? (
                          <>
                            <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
                            Dólar Americano (USD)
                          </>
                        ) : (
                          <>
                            <Euro className="mr-2 h-4 w-4 text-blue-500" />
                            Euro (EUR)
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={rate.buyRate} 
                          onChange={(e) => updateRate(rate.id, 'buyRate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={rate.sellRate} 
                          onChange={(e) => updateRate(rate.id, 'sellRate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        {rate.lastUpdated.toLocaleString('es-PE')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input 
                      id="name"
                      value={newUser.name} 
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={newUser.email} 
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
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
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={newUser.password} 
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
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
                            <div className="text-xs text-gray-500">{user.email}</div>
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
                            onClick={() => deleteUser(user.id)}
                            disabled={user.id === 1} // Proteger al admin principal
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Gestione cómo y cuándo recibir notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-alerts">Alertas por Correo</Label>
                    <p className="text-sm text-gray-500">
                      Recibir alertas importantes por correo electrónico
                    </p>
                  </div>
                  <Switch 
                    id="email-alerts"
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, emailAlerts: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rate-changes">Cambios en Tasas</Label>
                    <p className="text-sm text-gray-500">
                      Notificar cuando las tasas de cambio varíen significativamente
                    </p>
                  </div>
                  <Switch 
                    id="rate-changes"
                    checked={notifications.rateChanges}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, rateChanges: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-reports">Reportes Diarios</Label>
                    <p className="text-sm text-gray-500">
                      Recibir un resumen diario de todas las transacciones
                    </p>
                  </div>
                  <Switch 
                    id="daily-reports"
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, dailyReports: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Ajuste la configuración de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-500">
                      Requerir verificación adicional al iniciar sesión
                    </p>
                  </div>
                  <Switch 
                    id="two-factor"
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => 
                      setSecurity({...security, twoFactor: checked})
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Tiempo de Inactividad (minutos)</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Tiempo después del cual se cerrará la sesión por inactividad
                  </p>
                  <Select 
                    value={security.sessionTimeout} 
                    onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}
                  >
                    <SelectTrigger id="session-timeout">
                      <SelectValue placeholder="Seleccione tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSecuritySettings} className="ml-auto">
                <Lock className="mr-2 h-4 w-4" />
                Guardar Configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;

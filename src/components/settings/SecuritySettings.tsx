
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityState {
  twoFactor: boolean;
  sessionTimeout: string;
}

interface SecuritySettingsProps {
  security: SecurityState;
  setSecurity: React.Dispatch<React.SetStateAction<SecurityState>>;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  security,
  setSecurity
}) => {
  const saveSecuritySettings = () => {
    toast.success('Configuración de seguridad guardada');
  };

  return (
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
  );
};

export default SecuritySettings;

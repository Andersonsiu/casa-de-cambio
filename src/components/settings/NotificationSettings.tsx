
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsState {
  emailAlerts: boolean;
  rateChanges: boolean;
  dailyReports: boolean;
}

interface NotificationSettingsProps {
  notifications: NotificationsState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsState>>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
  setNotifications
}) => {
  const saveNotificationSettings = () => {
    toast.success('Configuración de notificaciones guardada');
  };

  return (
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
  );
};

export default NotificationSettings;

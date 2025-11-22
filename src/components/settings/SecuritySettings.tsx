// src/components/settings/SecuritySettings.tsx
import React, { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { Check, X } from 'lucide-react';

type SecurityState = {
  twoFactor: boolean;
  sessionTimeout: string;
};

interface SecuritySettingsProps {
  isAdmin: boolean;
  security: SecurityState;
  setSecurity: React.Dispatch<React.SetStateAction<SecurityState>>;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  isAdmin,
  security,
  setSecurity,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => [
      {
        label: 'Al menos 8 caracteres',
        valid: newPassword.length >= 8,
      },
      {
        label: 'Una letra mayúscula (A-Z)',
        valid: /[A-Z]/.test(newPassword),
      },
      {
        label: 'Una letra minúscula (a-z)',
        valid: /[a-z]/.test(newPassword),
      },
      {
        label: 'Al menos un número (0-9)',
        valid: /[0-9]/.test(newPassword),
      },
      {
        label: 'Al menos un carácter especial (!@#$%^&*)',
        valid: /[!@#$%^&*()_\-+=[\]{};:'",.<>/?`~|\\]/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const allRulesOk = rules.every((r) => r.valid);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirm) {
      toast.error('Completa todos los campos');
      return;
    }

    if (newPassword !== confirm) {
      toast.error('La confirmación no coincide con la nueva contraseña');
      return;
    }

    if (!allRulesOk) {
      toast.error('La nueva contraseña no cumple con los requisitos mínimos');
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email) {
      toast.error('No se encontró la sesión actual');
      return;
    }

    try {
      setSaving(true);

      // 1. Reautenticar al usuario con su contraseña actual
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // 2. Actualizar contraseña
      await updatePassword(user, newPassword);

      toast.success('Contraseña actualizada correctamente');

      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (error: any) {
      console.error(error);
      const code = error?.code as string | undefined;

      if (code === 'auth/wrong-password') {
        toast.error('La contraseña actual es incorrecta');
      } else if (code === 'auth/requires-recent-login') {
        toast.error(
          'Por seguridad, vuelve a iniciar sesión y luego intenta cambiar la contraseña.'
        );
      } else {
        toast.error('Error al actualizar la contraseña');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Card: Cambio de contraseña (para TODOS los roles) */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza la contraseña de tu cuenta siguiendo las políticas de
            seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña segura"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              La contraseña debe cumplir con:
            </p>
            <ul className="space-y-1 text-xs">
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 ${
                    rule.valid ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}
                >
                  {rule.valid ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Actualizar contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Opciones avanzadas SOLO para admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Opciones avanzadas</CardTitle>
            <CardDescription>
              Configura opciones de seguridad globales para la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Doble factor (2FA)</p>
                <p className="text-xs text-muted-foreground">
                  Requerir un segundo factor de autenticación para administradores.
                </p>
              </div>
              <Switch
                checked={security.twoFactor}
                onCheckedChange={(checked) =>
                  setSecurity((prev) => ({ ...prev, twoFactor: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">
                Tiempo de expiración de sesión (minutos)
              </Label>
              <Input
                id="sessionTimeout"
                type="number"
                min={5}
                max={240}
                value={security.sessionTimeout}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    sessionTimeout: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Después de este tiempo de inactividad, se cerrará la sesión de
                los usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecuritySettings;

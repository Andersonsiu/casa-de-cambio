import React, { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

import { auth } from '@/integrations/firebase/client';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { useUserRole } from '@/hooks/useUserRole';

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const passwordRules = {
  length: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /\d/.test(v),
  special: (v: string) => /[^A-Za-z0-9]/.test(v),
};

const PasswordRuleItem: React.FC<{ ok: boolean; children: React.ReactNode }> = ({
  ok,
  children,
}) => (
  <li className="flex items-center gap-2">
    {ok ? (
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
    ) : (
      <AlertCircle className="h-3 w-3 text-muted-foreground" />
    )}
    <span className={ok ? 'text-emerald-700' : ''}>{children}</span>
  </li>
);

const SecuritySettings: React.FC = () => {
  const { firebaseUser } = useUserRole();

  const [pwd, setPwd] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changing, setChanging] = useState(false);

  const passwordChecks = useMemo(() => {
    const v = pwd.newPassword;
    return {
      length: passwordRules.length(v),
      upper: passwordRules.upper(v),
      lower: passwordRules.lower(v),
      number: passwordRules.number(v),
      special: passwordRules.special(v),
    };
  }, [pwd.newPassword]);

  const isPasswordStrong = useMemo(
    () =>
      passwordChecks.length &&
      passwordChecks.upper &&
      passwordChecks.lower &&
      passwordChecks.number &&
      passwordChecks.special,
    [passwordChecks]
  );

  const handleChangePassword = async () => {
    if (!firebaseUser) {
      toast.error('No hay usuario autenticado');
      return;
    }

    if (!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }

    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordStrong) {
      toast.error('La nueva contraseña no cumple las políticas de seguridad');
      return;
    }

    if (!firebaseUser.email) {
      toast.error('El usuario actual no tiene email definido');
      return;
    }

    setChanging(true);
    try {
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        pwd.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, pwd.newPassword);

      toast.success('Contraseña actualizada correctamente');
      setPwd({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error(error);
      let msg = 'Error al actualizar la contraseña';
      if (error?.code === 'auth/wrong-password') {
        msg = 'La contraseña actual es incorrecta';
      }
      toast.error(msg);
    } finally {
      setChanging(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza la contraseña de tu cuenta siguiendo las políticas de
            seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-foreground">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={pwd.currentPassword}
                onChange={(e) =>
                  setPwd((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Ingresa tu contraseña actual"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() => setShowCurrent((v) => !v)}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-foreground">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={pwd.newPassword}
                onChange={(e) =>
                  setPwd((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Nueva contraseña segura"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={pwd.confirmPassword}
                onChange={(e) =>
                  setPwd((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Repite la nueva contraseña"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">
              La contraseña debe cumplir con:
            </p>
            <ul className="space-y-1">
              <PasswordRuleItem ok={passwordChecks.length}>
                Al menos 8 caracteres
              </PasswordRuleItem>
              <PasswordRuleItem ok={passwordChecks.upper}>
                Una letra mayúscula (A-Z)
              </PasswordRuleItem>
              <PasswordRuleItem ok={passwordChecks.lower}>
                Una letra minúscula (a-z)
              </PasswordRuleItem>
              <PasswordRuleItem ok={passwordChecks.number}>
                Al menos un número (0-9)
              </PasswordRuleItem>
              <PasswordRuleItem ok={passwordChecks.special}>
                Al menos un carácter especial (!@#$%^&amp;*)
              </PasswordRuleItem>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            onClick={handleChangePassword}
            disabled={changing}
          >
            {changing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Actualizar contraseña'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Seguridad de la cuenta
          </CardTitle>
          <CardDescription>
            Información sobre la seguridad de tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium text-foreground">Cuenta protegida</p>
              <p className="text-xs text-muted-foreground">
                Tu cuenta está protegida con contraseña segura. Recuerda no compartir
                tus credenciales con nadie.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Email de acceso:</span>
              <span className="font-medium text-foreground">{firebaseUser?.email || 'No disponible'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Último acceso:</span>
              <span className="font-medium text-foreground">
                {firebaseUser?.metadata?.lastSignInTime 
                  ? new Date(firebaseUser.metadata.lastSignInTime).toLocaleString('es-PE')
                  : 'No disponible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SecuritySettings;

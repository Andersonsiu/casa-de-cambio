// src/components/settings/SecuritySettings.tsx
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
import QRCode from 'react-qr-code';

import { auth } from '@/integrations/firebase/client';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
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

const SecuritySettings: React.FC = () => {
  const { firebaseUser, role } = useUserRole();

  // Campos de contraseña
  const [pwd, setPwd] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Mostrar / ocultar cada campo
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changing, setChanging] = useState(false);

  // 2FA
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSecretUri, setMfaSecretUri] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEnrolled, setMfaEnrolled] = useState<boolean>(() => {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      return user.multiFactor?.enrolledFactors?.length > 0;
    } catch {
      return false;
    }
  });

  // Chequeos de contraseña
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

  /***********************
   * CAMBIAR CONTRASEÑA
   ***********************/
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
      // 1. Reautenticación
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        pwd.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);

      // 2. Actualizar contraseña
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

  /***********************
   * 2FA TOTP REAL
   ***********************/
  const startEnroll2FA = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('No hay usuario autenticado');
      return;
    }

    try {
      // La mayoría de guías recomienda reautenticar antes de enrolar MFA.
      if (!firebaseUser?.email) {
        toast.error('El usuario actual no tiene email definido');
        return;
      }

      setMfaLoading(true);

      // 1. Obtener sesión MFA
      const mfaUser = multiFactor(user);
      const mfaSession = await mfaUser.getSession();

      // 2. Generar secreto TOTP
      const secret = await TotpMultiFactorGenerator.generateSecret(mfaSession);

      // 3. URL para QR (otpauth:// ...)
      const url = secret.generateQrCodeUrl(
        user.email ?? 'usuario',
        'Rojas Casa de cambio'
      );

      setTotpSecret(secret);
      setMfaSecretUri(url);

      toast.info(
        'Escanea el código QR con tu app de autenticación y luego ingresa el código de 6 dígitos.'
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        'Error al iniciar el enrolamiento de 2FA. Verifica que TOTP MFA esté habilitado en tu proyecto.'
      );
    } finally {
      setMfaLoading(false);
    }
  };

  const confirmEnroll2FA = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!totpSecret || !mfaSecretUri) {
      toast.error('No hay secreto TOTP generado. Vuelve a iniciar el proceso.');
      return;
    }

    if (!mfaCode) {
      toast.error('Ingresa el código generado por tu app de autenticación');
      return;
    }

    setMfaLoading(true);
    try {
      const mfaUser = multiFactor(user);

      // Crear la assertion usando el código de 6 dígitos
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        mfaCode
      );

      // Enrolar el factor TOTP
      await mfaUser.enroll(assertion, 'App de autenticación');

      setMfaEnrolled(true);
      setMfaSecretUri(null);
      setTotpSecret(null);
      setMfaCode('');

      toast.success('Autenticación en dos pasos activada');
    } catch (error: any) {
      console.error(error);
      toast.error('No se pudo verificar el código, intenta nuevamente');
    } finally {
      setMfaLoading(false);
    }
  };

  const disable2FA = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setMfaLoading(true);
    try {
      const mfaUser = multiFactor(user);

      if (!mfaUser.enrolledFactors.length) {
        toast.error('No tienes factores TOTP registrados');
        setMfaEnrolled(false);
        return;
      }

      // Aquí, por simplicidad, eliminamos el primer factor enrolado
      const factor = mfaUser.enrolledFactors[0];
      await mfaUser.unenroll(factor);

      setMfaEnrolled(false);
      setMfaSecretUri(null);
      setTotpSecret(null);
      setMfaCode('');

      toast.success('Autenticación en dos pasos desactivada');
    } catch (error: any) {
      console.error(error);
      toast.error('No se pudo desactivar la 2FA');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <>
      {/* CARD: Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza la contraseña de tu cuenta siguiendo las políticas de
            seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contraseña actual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
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

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
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

          {/* Confirmar nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
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

          {/* Lista de requisitos visual */}
          <div className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold">
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

      {/* CARD: 2FA / MFA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-finance-primary" />
            Autenticación en dos pasos (2FA)
          </CardTitle>
          <CardDescription>
            Protege tu cuenta añadiendo un segundo factor de verificación con
            una app de autenticación (Google Authenticator, Authy, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaEnrolled ? (
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">2FA activada en tu cuenta</p>
                <p className="text-xs opacity-80">
                  Cada vez que inicies sesión se te pedirá un código adicional
                  desde tu app de autenticación.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-medium">2FA desactivada</p>
                <p className="text-xs opacity-80">
                  Te recomendamos activar la autenticación en dos pasos para
                  aumentar la seguridad de tu cuenta.
                </p>
              </div>
            </div>
          )}

          {mfaSecretUri && (
            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-2 text-sm font-medium">
                1. Escanea este código en tu app de autenticación
              </p>

              <div className="flex justify-center py-4">
                <QRCode value={mfaSecretUri} size={160} />
              </div>

              <pre className="mb-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-50">
                {mfaSecretUri}
              </pre>
              <p className="mb-2 text-xs text-muted-foreground">
                Si tu app no permite escanear, puedes agregar manualmente usando
                este URI.
              </p>

              <div className="mt-4 space-y-2">
                <Label htmlFor="mfaCode">
                  2. Ingresa el código de 6 dígitos
                </Label>
                <Input
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            Rol actual: <span className="font-medium">{role}</span>
          </span>

          <div className="flex gap-2">
            {mfaEnrolled ? (
              <Button
                variant="outline"
                onClick={disable2FA}
                disabled={mfaLoading}
              >
                {mfaLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  'Desactivar 2FA'
                )}
              </Button>
            ) : mfaSecretUri ? (
              <Button onClick={confirmEnroll2FA} disabled={mfaLoading}>
                {mfaLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar código'
                )}
              </Button>
            ) : (
              <Button onClick={startEnroll2FA} disabled={mfaLoading}>
                {mfaLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando secreto...
                  </>
                ) : (
                  'Activar 2FA'
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

const PasswordRuleItem: React.FC<{ ok: boolean; children: React.ReactNode }> = ({
  ok,
  children,
}) => (
  <li className="flex items-center gap-2">
    {ok ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    ) : (
      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
    )}
    <span>{children}</span>
  </li>
);

export default SecuritySettings;

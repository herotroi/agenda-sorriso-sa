import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido').max(255);
const codeSchema = z.string().length(6, 'O código deve ter 6 dígitos');
const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial');

type Step = 'email' | 'code' | 'password';

interface PasswordRecoveryFlowProps {
  onSuccess?: () => void;
}

export const PasswordRecoveryFlow = ({ onSuccess }: PasswordRecoveryFlowProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validEmail = emailSchema.parse(email);

      const { data, error } = await supabase.functions.invoke('password-recovery', {
        body: { action: 'start', email: validEmail },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Código enviado!',
        description: 'Verifique seu email para obter o código de 6 dígitos.',
      });

      setStep('code');
      startCountdown();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar código',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);

    try {
      codeSchema.parse(code);

      const { data, error } = await supabase.functions.invoke('password-recovery', {
        body: { action: 'verify', email, code },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Código válido!',
        description: 'Agora defina sua nova senha.',
      });

      setStep('password');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Código inválido ou expirado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords
      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      passwordSchema.parse(newPassword);

      // Reset password
      const { data, error } = await supabase.functions.invoke('password-recovery', {
        body: { action: 'reset', email, code, new_password: newPassword },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Senha alterada!',
        description: 'Fazendo login...',
      });

      // Auto login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: newPassword,
      });

      if (signInError) {
        toast({
          title: 'Login manual necessário',
          description: 'Senha alterada com sucesso. Por favor, faça login.',
        });
        return;
      }

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao redefinir senha',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Email input
  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="recoveryEmail" className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="recoveryEmail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-sm text-muted-foreground">
            Digite seu email para receber o código de recuperação
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Código'
          )}
        </Button>
      </form>
    );
  }

  // Step 2: Code verification
  if (step === 'code') {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Código de Verificação
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Digite o código de 6 dígitos enviado para <strong>{email}</strong>
          </p>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={handleVerifyCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {canResend ? (
              <button
                type="button"
                onClick={handleSendCode}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                Reenviar código
              </button>
            ) : (
              `Reenviar código em ${countdown}s`
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setStep('email');
              setCode('');
            }}
          >
            Voltar
          </Button>
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: New password
  return (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Nova Senha
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Nova Senha
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">Requisitos da senha:</p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li className="list-disc">Mínimo 8 caracteres</li>
            <li className="list-disc">Letra maiúscula e minúscula</li>
            <li className="list-disc">Pelo menos um número</li>
            <li className="list-disc">Pelo menos um caractere especial</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setStep('code');
            setNewPassword('');
            setConfirmPassword('');
          }}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-primary to-secondary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Alterando...
            </>
          ) : (
            'Alterar Senha'
          )}
        </Button>
      </div>
    </form>
  );
};

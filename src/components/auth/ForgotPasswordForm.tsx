
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const ForgotPasswordForm = ({ onSubmit, isLoading }: ForgotPasswordFormProps) => {
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(resetEmail);
    setResetEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="resetEmail" className="text-xs sm:text-sm font-medium">Email</Label>
        <Input
          id="resetEmail"
          type="email"
          placeholder="seu@email.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
          className="h-10 sm:h-11 transition-all focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
        />
        <p className="text-xs sm:text-sm text-muted-foreground">
          Digite seu email para receber o link de recuperação de senha
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base" 
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>
    </form>
  );
};

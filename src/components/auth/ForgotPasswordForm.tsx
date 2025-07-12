
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resetEmail">Email</Label>
        <Input
          id="resetEmail"
          type="email"
          placeholder="seu@email.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
        />
        <p className="text-sm text-gray-600">
          Digite seu email para receber o link de recuperação de senha
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>
    </form>
  );
};

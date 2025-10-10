
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="email" className="text-xs sm:text-sm font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 sm:h-11 transition-all focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
        />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="password" className="text-xs sm:text-sm font-medium">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 sm:h-11 pr-10 transition-all focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base" 
        disabled={isLoading}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};

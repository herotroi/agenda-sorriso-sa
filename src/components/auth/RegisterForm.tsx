
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, fullName: string) => Promise<void>;
  isLoading: boolean;
}

export const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
      isValid: minLength && hasUppercase && hasLowercase && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid || !passwordsMatch) {
      return;
    }
    
    await onSubmit(email, password, fullName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="h-10 sm:h-11 transition-all focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
        />
      </div>
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
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
        
        {password && (
          <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
            <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
              {passwordValidation.minLength ? <Check className="h-3 w-3 mr-1 flex-shrink-0" /> : <X className="h-3 w-3 mr-1 flex-shrink-0" />}
              Mínimo 8 caracteres
            </div>
            <div className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
              {passwordValidation.hasUppercase ? <Check className="h-3 w-3 mr-1 flex-shrink-0" /> : <X className="h-3 w-3 mr-1 flex-shrink-0" />}
              Uma letra maiúscula
            </div>
            <div className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
              {passwordValidation.hasLowercase ? <Check className="h-3 w-3 mr-1 flex-shrink-0" /> : <X className="h-3 w-3 mr-1 flex-shrink-0" />}
              Uma letra minúscula
            </div>
            <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
              {passwordValidation.hasSpecialChar ? <Check className="h-3 w-3 mr-1 flex-shrink-0" /> : <X className="h-3 w-3 mr-1 flex-shrink-0" />}
              Um caractere especial
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium">Confirmar Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-10 sm:h-11 pr-10 transition-all focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
        
        {confirmPassword && (
          <div className={`flex items-center text-xs sm:text-sm mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
            {passwordsMatch ? <Check className="h-3 w-3 mr-1 flex-shrink-0" /> : <X className="h-3 w-3 mr-1 flex-shrink-0" />}
            {passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-10 sm:h-11 font-medium bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md mt-4 sm:mt-6 text-sm sm:text-base" 
        disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
      >
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  );
};

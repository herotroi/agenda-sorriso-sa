
import React from 'react';
import { Heart } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary relative z-10 drop-shadow-lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-3">
              Sistema de Gestão Médica
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Plataforma completa e moderna para gerenciamento de consultórios médicos e clínicas
          </p>
        </div>

        {children}

        <div className="text-center mt-12 text-muted-foreground/80 text-sm">
          <p>&copy; 2024 Sistema de Gestão Médica. Dados seguros e protegidos por criptografia.</p>
        </div>
      </div>
    </div>
  );
};

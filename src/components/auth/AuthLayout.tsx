
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
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 relative z-10">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary relative z-10 drop-shadow-lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:ml-3 text-center">
              Sistema de Gestão Médica
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto font-light px-4">
            Plataforma completa e moderna para gerenciamento de consultórios médicos e clínicas
          </p>
        </div>

        {children}

        <div className="text-center mt-8 sm:mt-12 text-muted-foreground/80 text-xs sm:text-sm px-4">
          <p>&copy; 2024 Sistema de Gestão Médica. Dados seguros e protegidos por criptografia.</p>
        </div>
      </div>
    </div>
  );
};

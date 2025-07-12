
import React from 'react';
import { Heart } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestão Médica</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma completa para gerenciamento de consultórios médicos e clínicas
          </p>
        </div>

        {children}

        <div className="text-center mt-12 text-gray-600">
          <p>&copy; 2024 Sistema de Gestão Médica. Dados seguros e protegidos.</p>
        </div>
      </div>
    </div>
  );
};

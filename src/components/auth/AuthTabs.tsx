
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthTabsProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  error: string;
  successMessage: string;
  isLoading: boolean;
}

export const AuthTabs = ({ 
  onSignIn, 
  onSignUp, 
  onResetPassword, 
  error, 
  successMessage, 
  isLoading 
}: AuthTabsProps) => {
  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Acesse sua conta</CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta, cadastre-se ou recupere sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
              <TabsTrigger value="reset">Esqueci a Senha</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <LoginForm onSubmit={onSignIn} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onSubmit={onSignUp} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="reset">
              <ForgotPasswordForm onSubmit={onResetPassword} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

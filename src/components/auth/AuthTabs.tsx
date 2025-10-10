import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordRecoveryFlow } from './PasswordRecoveryFlow';

interface AuthTabsProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onRecoverySuccess?: () => void;
  error: string;
  successMessage: string;
  isLoading: boolean;
}

export const AuthTabs = ({
  onSignIn,
  onSignUp,
  onResetPassword,
  onRecoverySuccess,
  error,
  successMessage,
  isLoading
}: AuthTabsProps) => {
  return (
    <div className="max-w-md mx-auto animate-fade-in px-3 sm:px-0" style={{ animationDelay: '300ms' }}>
      <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-center text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Acesse sua conta
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
            Entre com sua conta, cadastre-se ou recupere sua senha
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-auto">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs sm:text-sm py-2"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs sm:text-sm py-2"
              >
                Cadastrar
              </TabsTrigger>
              <TabsTrigger 
                value="reset"
                className="data-[state=active]:bg-background data-[state=active]:shadow-md transition-all text-xs sm:text-sm py-2"
              >
                Recuperar
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4 animate-fade-in border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mt-4 border-green-500/50 bg-green-50 dark:bg-green-950/20 animate-fade-in">
                <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                <AlertDescription className="text-green-800 dark:text-green-300">{successMessage}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="mt-4 sm:mt-6">
              <LoginForm onSubmit={onSignIn} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="register" className="mt-4 sm:mt-6">
              <RegisterForm onSubmit={onSignUp} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="reset" className="mt-4 sm:mt-6">
              <PasswordRecoveryFlow onSuccess={onRecoverySuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

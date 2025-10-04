
import React, { useState } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FeaturesSection } from '@/components/auth/FeaturesSection';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { AuthTabs } from '@/components/auth/AuthTabs';

const Auth = () => {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordRecovery = searchParams.get('type') === 'recovery';

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setError('');

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    } else {
      setError('');
      alert('Cadastro realizado! Verifique seu email para confirmar a conta.');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Por favor, informe seu email');
      setIsLoading(false);
      return;
    }

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Link de recuperação enviado! Verifique seu email.');
    }
    
    setIsLoading(false);
  };

  // Redirecionar se já estiver logado (exceto durante recuperação de senha)
  if (user && !isPasswordRecovery) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isPasswordRecovery) {
    return (
      <AuthLayout>
        <PasswordResetForm />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <FeaturesSection />
      <AuthTabs
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onResetPassword={handleResetPassword}
        onRecoverySuccess={() => navigate('/dashboard')}
        error={error}
        successMessage={successMessage}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
};

export default Auth;

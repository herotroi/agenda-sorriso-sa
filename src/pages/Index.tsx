
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se estiver logado, redireciona para o dashboard
        navigate('/dashboard');
      } else {
        // Se não estiver logado, redireciona para a página de autenticação
        navigate('/auth');
      }
    }
  }, [navigate, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
};

export default Index;

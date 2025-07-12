
import { useState, useEffect } from 'react';
import { PricingCard } from '@/components/Subscription/PricingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard, Users, Calendar, FileText, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    title: 'Plano Gratuito',
    price: 0,
    period: 'sempre',
    features: [
      '50 agendamentos',
      '10 pacientes',
      '1 profissional',
      '5 procedimentos',
      'Sem acesso ao prontuário',
    ],
    limits: {
      appointments: 50,
      patients: 10,
      professionals: 1,
      procedures: 5,
      hasEhr: false,
    },
  },
  {
    id: 'monthly',
    title: 'Plano Mensal',
    price: 45,
    period: 'mês',
    features: [
      'Agendamentos ilimitados',
      'Pacientes ilimitados',
      'Profissionais ilimitados',
      'Procedimentos ilimitados',
      'Acesso completo ao prontuário',
    ],
    limits: {
      appointments: -1,
      patients: -1,
      professionals: -1,
      procedures: -1,
      hasEhr: true,
    },
  },
  {
    id: 'annual',
    title: 'Plano Anual',
    price: 39,
    period: 'mês',
    features: [
      'Agendamentos ilimitados',
      'Pacientes ilimitados',
      'Profissionais ilimitados',
      'Procedimentos ilimitados',
      'Acesso completo ao prontuário',
      '2 meses grátis no pagamento anual',
    ],
    isPopular: true,
    limits: {
      appointments: -1,
      patients: -1,
      professionals: -1,
      procedures: -1,
      hasEhr: true,
    },
  },
];

export default function Assinatura() {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return;
      }
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase.rpc('get_user_usage_stats', {
        p_user_id: user.user.id
      });
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }
      
      setUsageStats(data[0]);
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setChecking(true);
      await Promise.all([checkSubscription(), fetchUsageStats()]);
      setChecking(false);
    };
    loadData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast.info('Você já está no plano gratuito');
      return;
    }

    console.log('Iniciando assinatura para:', planId);
    setLoading(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
      });

      if (error) {
        console.error('Erro ao criar checkout:', error);
        toast.error('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Erro ao acessar portal:', error);
        toast.error('Erro ao acessar portal de gerenciamento.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

  const currentPlan = plans.find(plan => plan.id === currentSubscription?.plan_type) || plans[0];

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-600">Gerencie sua assinatura e planos</p>
      </div>

      {/* Status da Assinatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant={currentSubscription?.plan_type === 'free' ? 'secondary' : 'default'}>
                  {currentSubscription?.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <span className="text-sm text-gray-600">{currentPlan.title}</span>
              </div>
              {currentSubscription?.current_period_end && (
                <p className="text-sm text-gray-600">
                  Próxima cobrança: {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              )}
              <p className="text-lg font-semibold">
                {currentPlan.price === 0 ? 'Gratuito' : `R$ ${currentPlan.price},00/${currentPlan.period}`}
              </p>
            </div>
            {currentSubscription?.plan_type !== 'free' && (
              <Button variant="outline" onClick={handleManageSubscription}>
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uso Atual */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uso Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{usageStats.appointments_count}</p>
                <p className="text-sm text-gray-600">
                  Agendamentos {currentPlan.limits.appointments === -1 ? '' : `/ ${currentPlan.limits.appointments}`}
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{usageStats.patients_count}</p>
                <p className="text-sm text-gray-600">
                  Pacientes {currentPlan.limits.patients === -1 ? '' : `/ ${currentPlan.limits.patients}`}
                </p>
              </div>
              <div className="text-center">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{usageStats.professionals_count}</p>
                <p className="text-sm text-gray-600">
                  Profissionais {currentPlan.limits.professionals === -1 ? '' : `/ ${currentPlan.limits.professionals}`}
                </p>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{usageStats.procedures_count}</p>
                <p className="text-sm text-gray-600">
                  Procedimentos {currentPlan.limits.procedures === -1 ? '' : `/ ${currentPlan.limits.procedures}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isPopular={plan.isPopular}
              isCurrentPlan={currentSubscription?.plan_type === plan.id}
              onSubscribe={() => handleSubscribe(plan.id)}
              loading={loading === plan.id}
            />
          ))}
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Métodos de Pagamento Aceitos:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Cartão de Crédito (Visa, Mastercard, American Express)</li>
                <li>• PIX (disponível via Stripe)</li>
                <li>• Boleto Bancário</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Política de Cancelamento:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Cancele a qualquer momento</li>
                <li>• Sem taxas de cancelamento</li>
                <li>• Acesso mantido até o fim do período pago</li>
                <li>• Dados preservados por 30 dias após cancelamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

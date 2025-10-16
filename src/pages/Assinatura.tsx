
import { useState, useEffect } from 'react';
import { PricingCard } from '@/components/Subscription/PricingCard';
import { CouponSection } from '@/components/Configuracoes/CouponSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard, Users, Calendar, FileText, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const getDefaultPlans = () => [
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
      'Procedimentos ilimitados',
      'Acesso completo ao prontuário',
      '+ econômico',
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
  const [hasAutomacao, setHasAutomacao] = useState(false);
  const [plans, setPlans] = useState(getDefaultPlans());
  const [monthlyPrices, setMonthlyPrices] = useState<any[]>([]);
  const [yearlyPrices, setYearlyPrices] = useState<any[]>([]);
  const [monthlyQuantity, setMonthlyQuantity] = useState(1);
  const [annualQuantity, setAnnualQuantity] = useState(1);

  const checkSubscription = async () => {
    try {
      console.log('Checking subscription...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        toast.error('Erro ao verificar assinatura');
        return;
      }
      console.log('Subscription data:', data);
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao verificar assinatura');
    }
  };

  const fetchStripePrices = async () => {
    try {
      console.log('Fetching Stripe prices...');
      const { data, error } = await supabase.functions.invoke('get-stripe-prices');
      
      if (error) {
        console.error('Erro ao buscar preços da Stripe:', error);
        return;
      }
      
      if (data) {
        console.log('Stripe prices:', data);
        
        if (data.monthly && Array.isArray(data.monthly)) {
          setMonthlyPrices(data.monthly);
        }

        if (data.yearly && Array.isArray(data.yearly)) {
          setYearlyPrices(data.yearly);
        }
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar preços:', error);
    }
  };

  const getPriceForQuantity = (prices: any[], quantity: number) => {
    return prices.find(p => p.quantity === quantity) || prices[0] || { unitAmount: 0, total: 0, priceId: '' };
  };

  const fetchUsageStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      console.log('Fetching usage stats...');
      const { data, error } = await supabase.rpc('get_user_usage_stats', {
        p_user_id: user.user.id
      });
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }
      
      console.log('Usage stats:', data);
      setUsageStats(data && data[0] ? data[0] : {
        appointments_count: 0,
        patients_count: 0,
        professionals_count: 0,
        procedures_count: 0
      });

      // Check if user has automacao
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('automacao')
        .eq('id', user.user.id)
        .single();

      if (!profileError && profile) {
        setHasAutomacao(profile.automacao || false);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setChecking(true);
      await Promise.all([checkSubscription(), fetchUsageStats(), fetchStripePrices()]);
      setChecking(false);
    };
    loadData();
  }, []);

  // Inicializar quantidade baseada no plano atual do usuário
  useEffect(() => {
    if (currentSubscription && usageStats) {
      const contractedProfessionals = usageStats.professionals_count || 1;
      if (currentSubscription.plan_type === 'monthly') {
        setMonthlyQuantity(contractedProfessionals);
      } else if (currentSubscription.plan_type === 'annual') {
        setAnnualQuantity(contractedProfessionals);
      }
    }
  }, [currentSubscription, usageStats]);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast.info('Você já está no plano gratuito');
      return;
    }

    if (hasAutomacao) {
      toast.info('Você já possui acesso ilimitado ativo');
      return;
    }

    const quantity = planId === 'monthly' ? monthlyQuantity : annualQuantity;
    const prices = planId === 'monthly' ? monthlyPrices : yearlyPrices;
    const selectedPrice = getPriceForQuantity(prices, quantity);

    if (!selectedPrice.priceId) {
      toast.error('Preço não encontrado para essa quantidade');
      return;
    }
    
    console.log('Iniciando assinatura para:', planId, 'Quantidade:', quantity, 'Price:', selectedPrice);
    setLoading(planId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: selectedPrice.priceId, quantity },
      });

      if (error) {
        console.error('Erro ao criar checkout:', error);
        toast.error(`Erro ao processar pagamento: ${error.message || 'Tente novamente.'}`);
        return;
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.open(data.url, '_blank');
      } else {
        toast.error('Erro: URL de pagamento não recebida');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Erro ao acessar portal:', error);
        toast.error(`Erro ao acessar portal: ${error.message || 'Tente novamente.'}`);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        toast.error('Erro: URL do portal não recebida');
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

      {/* Cupom Section */}
      <CouponSection />

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
                  {hasAutomacao ? 'Ilimitado' : (currentSubscription?.status === 'active' ? 'Ativo' : 'Inativo')}
                </Badge>
                <span className="text-sm text-gray-600">
                  {hasAutomacao ? 'Acesso Ilimitado' : currentPlan.title}
                </span>
              </div>
              {currentSubscription?.current_period_end && !hasAutomacao && (
                <p className="text-sm text-gray-600">
                  Próxima cobrança: {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              )}
              <p className="text-lg font-semibold">
                {hasAutomacao ? 'Ilimitado' : (currentPlan.price === 0 ? 'Gratuito' : `R$ ${currentPlan.price},00/${currentPlan.period}`)}
              </p>
            </div>
            {currentSubscription?.plan_type !== 'free' && !hasAutomacao && (
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
                <p className="text-2xl font-bold">{usageStats.appointments_count || 0}</p>
                <p className="text-sm text-gray-600">
                  Agendamentos {hasAutomacao || currentPlan.limits.appointments === -1 ? '' : `/ ${currentPlan.limits.appointments}`}
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{usageStats.patients_count || 0}</p>
                <p className="text-sm text-gray-600">
                  Pacientes {hasAutomacao || currentPlan.limits.patients === -1 ? '' : `/ ${currentPlan.limits.patients}`}
                </p>
              </div>
              <div className="text-center">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{usageStats.professionals_count || 0}</p>
                <p className="text-sm text-gray-600">
                  Profissionais {hasAutomacao || currentPlan.limits.professionals === -1 ? '' : `/ ${currentPlan.limits.professionals}`}
                </p>
              </div>
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{usageStats.procedures_count || 0}</p>
                <p className="text-sm text-gray-600">
                  Procedimentos {hasAutomacao || currentPlan.limits.procedures === -1 ? '' : `/ ${currentPlan.limits.procedures}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis - Only show if user doesn't have automacao */}
      {!hasAutomacao && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl">
            {plans.map((plan) => {
              const monthlyPrice = getPriceForQuantity(monthlyPrices, monthlyQuantity);
              const yearlyPrice = getPriceForQuantity(yearlyPrices, annualQuantity);
              
              return (
                <PricingCard
                  key={plan.id}
                  title={plan.title}
                  price={plan.id === 'monthly' ? monthlyPrice.total : plan.id === 'annual' ? yearlyPrice.total : plan.price}
                  period={plan.period}
                  features={plan.features}
                  isPopular={plan.isPopular}
                  isCurrentPlan={currentSubscription?.plan_type === plan.id}
                  onSubscribe={() => handleSubscribe(plan.id)}
                  loading={loading === plan.id}
                  quantity={plan.id === 'monthly' ? monthlyQuantity : plan.id === 'annual' ? annualQuantity : 1}
                  onQuantityChange={plan.id === 'monthly' ? setMonthlyQuantity : plan.id === 'annual' ? setAnnualQuantity : undefined}
                  unitPrice={plan.id === 'monthly' ? monthlyPrice.unitAmount : plan.id === 'annual' ? yearlyPrice.unitAmount : 0}
                  fixedFee={plan.id === 'monthly' ? (monthlyPrice.flatFee || 0) : plan.id === 'annual' ? (yearlyPrice.flatFee || 0) : 0}
                  maxQuantity={plan.id === 'monthly' ? (monthlyPrices.length > 0 ? Math.max(...monthlyPrices.map(p => p.quantity)) : 10) : plan.id === 'annual' ? (yearlyPrices.length > 0 ? Math.max(...yearlyPrices.map(p => p.quantity)) : 10) : 1}
                />
              );
            })}
          </div>
        </div>
      )}

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

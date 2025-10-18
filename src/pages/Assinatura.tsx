import { useState, useEffect } from 'react';
import { PricingCard } from '@/components/Subscription/PricingCard';
import { BillingPeriodToggle } from '@/components/Subscription/BillingPeriodToggle';
import { CouponSection } from '@/components/Configuracoes/CouponSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, Settings, CreditCard, Users, FileText, Stethoscope, Clock, Info, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const getDefaultPlans = () => [{
  id: 'free',
  title: 'Plano Gratuito',
  price: 0,
  period: 'sempre',
  features: ['50 agendamentos', '10 pacientes', '1 profissional', '5 procedimentos', 'Sem acesso ao prontuário'],
  limits: {
    appointments: 50,
    patients: 10,
    professionals: 1,
    procedures: 5,
    hasEhr: false
  }
}, {
  id: 'paid',
  title: 'Planos',
  price: 45,
  period: 'período',
  features: ['Agendamentos ilimitados', 'Pacientes ilimitados', 'Procedimentos ilimitados', 'Acesso completo ao prontuário'],
  limits: {
    appointments: -1,
    patients: -1,
    professionals: -1,
    procedures: -1,
    hasEhr: true
  }
}];
export default function Assinatura() {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [hasAutomacao, setHasAutomacao] = useState(false);
  const [plans, setPlans] = useState(getDefaultPlans());
  const [monthlyPrices, setMonthlyPrices] = useState<any[]>([]);
  const [yearlyPrices, setYearlyPrices] = useState<any[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [quantity, setQuantity] = useState(1);
  const [canceling, setCanceling] = useState(false);
  const [currentLimits, setCurrentLimits] = useState<any>(null);

  // Mapear plan_type para plano de exibição
  const getPlanForDisplay = () => {
    if (!currentSubscription) return plans[0]; // free

    const planType = currentSubscription.plan_type;
    if (planType === 'free') return plans[0];
    if (planType === 'monthly' || planType === 'annual') return plans[1]; // paid

    return plans[0];
  };
  const currentPlan = getPlanForDisplay();

  // Descrição do plano atual
  const getCurrentPlanDescription = () => {
    if (hasAutomacao) return 'Plano Ilimitado';
    if (!currentSubscription || currentSubscription.plan_type === 'free') return 'Plano Gratuito';
    const profCount = currentSubscription.professionals_purchased || 1;
    const periodText = currentSubscription.plan_type === 'annual' ? 'Anual' : 'Mensal';
    return `Plano ${periodText} - ${profCount} ${profCount === 1 ? 'Profissional' : 'Profissionais'}`;
  };

  // Calcular valor atual do plano baseado na quantidade de profissionais
  const getCurrentPlanPrice = () => {
    if (hasAutomacao) return null;
    if (!currentSubscription || currentSubscription.plan_type === 'free') return 0;
    const profCount = currentSubscription.professionals_purchased || 1;
    const prices = currentSubscription.plan_type === 'annual' ? yearlyPrices : monthlyPrices;
    const priceData = prices.find(p => p.quantity === profCount);
    return priceData ? priceData.total : 0;
  };
  const checkSubscription = async () => {
    try {
      console.log('Checking subscription...');
      const {
        data,
        error
      } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        toast.error('Erro ao verificar assinatura');
        return;
      }
      console.log('Subscription data:', data);
      setCurrentSubscription(data);

      // Buscar limites do plano atual
      if (data?.plan_type) {
        const {
          data: limits
        } = await supabase.from('subscription_limits').select('*').eq('plan_type', data.plan_type).single();
        setCurrentLimits(limits);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao verificar assinatura');
    }
  };
  const fetchStripePrices = async () => {
    try {
      console.log('Fetching Stripe prices...');
      const {
        data,
        error
      } = await supabase.functions.invoke('get-stripe-prices');
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
    return prices.find(p => p.quantity === quantity) || prices[0] || {
      unitAmount: 0,
      total: 0,
      priceId: ''
    };
  };
  const fetchUsageStats = async () => {
    try {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) return;
      console.log('Fetching usage stats...');
      const {
        data,
        error
      } = await supabase.rpc('get_user_usage_stats', {
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
      const {
        data: profile,
        error: profileError
      } = await supabase.from('profiles').select('automacao').eq('id', user.user.id).single();
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

  // Inicializar quantidade e período baseado no plano atual do usuário
  useEffect(() => {
    if (currentSubscription && usageStats) {
      const contractedProfessionals = currentSubscription?.professionals_purchased || usageStats.professionals_count || 1;
      setQuantity(contractedProfessionals);
      if (currentSubscription.plan_type === 'annual') {
        setBillingPeriod('annual');
      } else {
        setBillingPeriod('monthly');
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
    const prices = billingPeriod === 'monthly' ? monthlyPrices : yearlyPrices;
    const selectedPrice = getPriceForQuantity(prices, quantity);
    if (!selectedPrice.priceId) {
      toast.error('Preço não encontrado para essa quantidade');
      return;
    }
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    const currentProfessionals = currentSubscription?.professionals_purchased || 0;
    const hasActiveSubscription = currentSubscription && currentSubscription.plan_type !== 'free' && currentSubscription.stripe_subscription_id;

    // Se já tem assinatura ativa no mesmo período
    if (hasActiveSubscription && billingPeriod === currentSubscription.plan_type) {
      const isDowngrade = quantity < currentProfessionals;
      const isUpgrade = quantity > currentProfessionals;
      if (isDowngrade) {
        // Verificar quantos profissionais ativos o usuário tem
        const {
          data: activeProfessionals
        } = await supabase.from('professionals').select('id').eq('user_id', user!.id).eq('active', true);
        const activeProfessionalsCount = activeProfessionals?.length || 0;
        if (activeProfessionalsCount > quantity) {
          toast.error(`Você tem ${activeProfessionalsCount} profissionais ativos. Desative ${activeProfessionalsCount - quantity} profissional(is) antes de fazer downgrade.`, {
            duration: 6000
          });
          return;
        }

        // Confirmação para downgrade
        const confirmDowngrade = window.confirm(`Tem certeza que deseja reduzir de ${currentProfessionals} para ${quantity} profissional(is)?\n\n` + `O valor não será reembolsado, mas será aplicado como crédito no próximo período.\n` + `A partir da próxima fatura você pagará ${selectedPrice.total.toFixed(2)}/${billingPeriod === 'monthly' ? 'mês' : 'ano'}.`);
        if (!confirmDowngrade) return;
        try {
          setLoading(planId);
          const {
            data,
            error
          } = await supabase.functions.invoke('update-subscription', {
            body: {
              quantity
            }
          });
          if (error) throw error;
          toast.success(data.message);
          await checkSubscription();
          await fetchUsageStats();
        } catch (error: any) {
          console.error('Erro ao atualizar assinatura (downgrade):', error);
          toast.error(error.message || 'Erro ao atualizar assinatura');
        } finally {
          setLoading('');
        }
        return;
      }
      if (isUpgrade) {
        // Confirmar upgrade com novo fluxo: contratamos NOVA assinatura e cancelamos a antiga com reembolso após pagamento
        const confirmUpgrade = window.confirm(`Confirmar upgrade de ${currentProfessionals} para ${quantity} profissional(is)?\n\n` + `Você será cobrado pelo novo plano agora (R$ ${selectedPrice.total.toFixed(2)}/${billingPeriod === 'monthly' ? 'mês' : 'ano'}).\n` + `Após o pagamento, o plano antigo será cancelado automaticamente com reembolso proporcional do período não utilizado.`);
        if (!confirmUpgrade) return;
        try {
          setLoading(planId);
          const {
            data,
            error
          } = await supabase.functions.invoke('create-checkout', {
            body: {
              priceId: selectedPrice.priceId,
              quantity
            }
          });
          if (error) throw error;
          if (data?.url) {
            window.open(data.url, '_blank');
            toast.info('Abrimos a página de pagamento em uma nova aba. Após confirmar, o plano antigo será cancelado com reembolso.');
          } else {
            toast.error('Erro: URL de pagamento não recebida');
          }
        } catch (error: any) {
          console.error('Erro ao iniciar upgrade:', error);
          toast.error(error.message || 'Erro ao iniciar upgrade');
        } finally {
          setLoading('');
        }
        return;
      }

      // Se não for upgrade nem downgrade, nada a fazer
      return;
    }

    // Se está mudando período de cobrança ou não tem assinatura, usar checkout normal
    if (hasActiveSubscription) {
      const confirmChange = window.confirm(`Confirmar troca de plano?\n\n` + `Nova cobrança: R$ ${selectedPrice.total.toFixed(2)}/${billingPeriod === 'monthly' ? 'mês' : 'ano'}`);
      if (!confirmChange) return;
    }
    console.log('Iniciando assinatura:', billingPeriod, 'Quantidade:', quantity, 'Price:', selectedPrice);
    setLoading(planId);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: selectedPrice.priceId,
          quantity
        }
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
      const {
        data,
        error
      } = await supabase.functions.invoke('customer-portal');
      if (error) {
        console.error('Erro ao acessar portal:', error);
        // Se o erro for de configuração do portal, mostrar mensagem mais amigável
        if (error.message?.includes('configuration')) {
          toast.error('O portal de gerenciamento precisa ser configurado. Entre em contato com o suporte.');
        } else {
          toast.error(`Erro ao acessar portal: ${error.message || 'Tente novamente.'}`);
        }
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
  const handleCancelSubscription = async () => {
    const confirmed = confirm('Tem certeza que deseja cancelar sua assinatura? Você manterá acesso até o final do período atual, ' + 'mas após isso voltará ao plano gratuito.');
    if (!confirmed) return;
    try {
      setCanceling(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      toast.success(`Assinatura Cancelada. Você terá acesso até ${data.access_until}.`);

      // Recarregar dados da assinatura
      await checkSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setCanceling(false);
    }
  };
  if (checking) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando assinatura...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie sua assinatura e planos</p>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3 flex-1">
              {currentSubscription?.cancel_at && <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span className="text-sm">
                    Cancela em {format(new Date(currentSubscription.cancel_at), "dd 'de' MMM'.'", {
                  locale: ptBR
                })}
                  </span>
                </div>}
              
              <h3 className="text-lg font-semibold">
                {currentSubscription?.plan_type === 'free' ? 'Plano Gratuito' : `Planos (×${currentSubscription?.professionals_purchased || 1})`}
              </h3>
              
              <p className="text-3xl font-bold">
                {hasAutomacao ? 'Ilimitado' : currentSubscription?.plan_type === 'free' ? 'Gratuito' : `R$ ${(getCurrentPlanPrice() || 0).toFixed(2).replace('.', ',')} por mês`}
              </p>
              
              {currentSubscription?.plan_type !== 'free' && currentSubscription?.current_period_end && <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Ver detalhes
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Esta assinatura será {currentSubscription?.cancel_at ? 'cancelada' : 'renovada'} em {format(new Date(currentSubscription.current_period_end), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR
                    })}.
                      </span>
                    </div>
                  </CollapsibleContent>
                </Collapsible>}
              
              {currentSubscription?.using_coupon && <Badge variant="outline" className="w-fit">
                  Cupom Ativo{currentSubscription?.coupon_code ? `: ${currentSubscription.coupon_code}` : ''}
                </Badge>}
            </div>
            {currentSubscription?.plan_type !== 'free' && !hasAutomacao && <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleManageSubscription} className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription} disabled={canceling} className="w-full sm:w-auto">
                  {canceling ? 'Cancelando...' : 'Cancelar'}
                </Button>
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* Uso Atual */}
      {usageStats && <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uso Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{usageStats.appointments_count || 0}</p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Agendamentos{hasAutomacao || currentLimits?.max_appointments === -1 ? ' / ilimitado' : ` / ${currentPlan.limits.appointments}`}
                </p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
                <Users className="h-8 w-8 mb-2 text-secondary" />
                <p className="text-2xl font-bold text-foreground">{usageStats.patients_count || 0}</p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Pacientes{hasAutomacao || currentLimits?.max_patients === -1 ? ' / ilimitado' : ` / ${currentPlan.limits.patients}`}
                </p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
                <Stethoscope className="h-8 w-8 mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{usageStats.professionals_count || 0}</p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Profissionais{hasAutomacao ? '' : currentLimits?.max_professionals === -1 ? ` / ${currentSubscription?.professionals_purchased || 1}` : currentPlan.limits.professionals === -1 ? '' : ` / ${currentPlan.limits.professionals}`}
                </p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{usageStats.procedures_count || 0}</p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Procedimentos{hasAutomacao || currentLimits?.max_procedures === -1 ? ' / ilimitado' : ` / ${currentPlan.limits.procedures}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Planos Disponíveis - Only show if user doesn't have automacao */}
      {!hasAutomacao && <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
          
          <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map(plan => {
          const currentPrices = billingPeriod === 'monthly' ? monthlyPrices : yearlyPrices;
          const selectedPrice = getPriceForQuantity(currentPrices, quantity);
          const isPaidPlan = plan.id === 'paid';
          const maxQty = currentPrices.length > 0 ? Math.max(...currentPrices.map(p => p.quantity)) : 30;
          return <PricingCard key={plan.id} title={plan.title} price={isPaidPlan ? selectedPrice.total : plan.price} period={isPaidPlan ? billingPeriod === 'monthly' ? 'mês' : 'ano' : plan.period} features={plan.features} isPopular={billingPeriod === 'annual' && isPaidPlan} isCurrentPlan={currentSubscription?.plan_type === 'monthly' && billingPeriod === 'monthly' && isPaidPlan && quantity === (currentSubscription?.professionals_purchased || 1) || currentSubscription?.plan_type === 'annual' && billingPeriod === 'annual' && isPaidPlan && quantity === (currentSubscription?.professionals_purchased || 1) || currentSubscription?.plan_type === 'free' && plan.id === 'free'} onSubscribe={() => handleSubscribe(plan.id)} loading={loading === plan.id} quantity={isPaidPlan ? quantity : 1} onQuantityChange={isPaidPlan ? setQuantity : undefined} unitPrice={isPaidPlan ? selectedPrice.unitAmount : 0} fixedFee={isPaidPlan ? selectedPrice.flatFee || 0 : 0} maxQuantity={isPaidPlan ? maxQty : 1} billingPeriod={isPaidPlan ? billingPeriod : undefined} hasActivePaidPlan={currentSubscription?.plan_type !== 'free'} currentProfessionals={usageStats?.professionals_count || 0} />;
        })}
          </div>
        </div>}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Métodos de Pagamento Aceitos:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Cartão de Crédito (Visa, Mastercard, American Express)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>PIX (disponível via Stripe)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Boleto Bancário</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Política de Cancelamento:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Cancele a qualquer momento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Sem taxas de cancelamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Acesso mantido até o fim do período pago</span>
                </li>
                <li className="flex items-start gap-2">
                  
                  
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}
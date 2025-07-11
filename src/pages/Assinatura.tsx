
import { useState } from 'react';
import { PricingCard } from '@/components/Subscription/PricingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const plans = [
  {
    id: 'monthly',
    title: 'Plano Mensal',
    price: 45,
    period: 'mês',
    features: [
      'Agenda inteligente',
      'Agendamento para múltiplos profissionais',
      'Cadastro ilimitado',
      'Prontuário eletrônico',
      'Dashboard interativo',
    ],
  },
  {
    id: 'annual',
    title: 'Plano Anual',
    price: 39,
    period: 'mês',
    features: [
      'Agenda inteligente',
      'Agendamento para múltiplos profissionais',
      'Cadastro ilimitado',
      'Prontuário eletrônico',
      'Dashboard interativo',
      '2 meses grátis no pagamento anual',
    ],
    isPopular: true,
  },
];

export default function Assinatura() {
  const [currentPlan] = useState('monthly'); // Mock do plano atual
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
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
        // Abre o checkout do Stripe em uma nova aba
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
    console.log('Gerenciar assinatura');
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Erro ao acessar portal:', error);
        toast.error('Erro ao acessar portal de gerenciamento.');
        return;
      }

      if (data?.url) {
        // Abre o portal do cliente em uma nova aba
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
    }
  };

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
                <Badge variant="default">Ativo</Badge>
                <span className="text-sm text-gray-600">Plano Mensal</span>
              </div>
              <p className="text-sm text-gray-600">
                Próxima cobrança: 15 de Fevereiro de 2024
              </p>
              <p className="text-lg font-semibold">R$ 45,00/mês</p>
            </div>
            <Button variant="outline" onClick={handleManageSubscription}>
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Planos Disponíveis</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isPopular={plan.isPopular}
              isCurrentPlan={currentPlan === plan.id}
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

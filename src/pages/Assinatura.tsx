
import { useState } from 'react';
import { PricingCard } from '@/components/Subscription/PricingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard } from 'lucide-react';

const plans = [
  {
    id: 'monthly',
    title: 'Plano Mensal',
    price: 35,
    period: 'mês',
    features: [
      'Agenda completa para múltiplos profissionais',
      'Cadastro ilimitado de pacientes',
      'Prontuário eletrônico básico',
      'Relatórios e dashboards',
      'Suporte por email',
      'Backup automático dos dados',
    ],
  },
  {
    id: 'annual',
    title: 'Plano Anual',
    price: 30,
    period: 'mês',
    features: [
      'Agenda completa para múltiplos profissionais',
      'Cadastro ilimitado de pacientes',
      'Prontuário eletrônico básico',
      'Relatórios e dashboards',
      'Suporte prioritário',
      'Backup automático dos dados',
      'Lembretes por WhatsApp (em breve)',
      '2 meses grátis no pagamento anual',
    ],
    isPopular: true,
  },
];

export default function Assinatura() {
  const [currentPlan] = useState('monthly'); // Mock do plano atual

  const handleSubscribe = (planId: string) => {
    console.log('Iniciando assinatura para:', planId);
    // Aqui será implementada a integração com Stripe
  };

  const handleManageSubscription = () => {
    console.log('Gerenciar assinatura');
    // Aqui será implementado o portal do cliente Stripe
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
              <p className="text-lg font-semibold">R$ 35,00/mês</p>
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

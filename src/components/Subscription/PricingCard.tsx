import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  loading?: boolean;
  onSubscribe: () => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  unitPrice?: number;
  fixedFee?: number;
  maxQuantity?: number;
  billingPeriod?: 'monthly' | 'annual';
  hasActivePaidPlan?: boolean;
  currentProfessionals?: number;
}
export function PricingCard({
  title,
  price,
  period,
  features,
  isPopular,
  isCurrentPlan,
  loading = false,
  onSubscribe,
  quantity = 1,
  onQuantityChange,
  unitPrice = 0,
  fixedFee = 0,
  maxQuantity = 10,
  billingPeriod,
  hasActivePaidPlan = false,
  currentProfessionals = 0
}: PricingCardProps) {
  const isPaidPlan = price > 0 || unitPrice > 0;
  const totalPrice = unitPrice * quantity + (fixedFee || 0);

  // Determinar o texto do botão baseado no contexto
  const getButtonText = () => {
    if (loading) return 'Processando...';

    // Se é plano gratuito e está ativo
    if (!isPaidPlan && isCurrentPlan) return 'Plano Atual';
    if (isPaidPlan && hasActivePaidPlan) {
      // Se mudou a quantidade, permitir upgrade/downgrade mesmo sendo o mesmo período
      if (quantity > currentProfessionals) return 'Fazer Upgrade';
      if (quantity < currentProfessionals) return 'Fazer Downgrade';

      // Se é exatamente o mesmo plano
      if (isCurrentPlan) return 'Plano Atual';
      return 'Trocar Plano';
    }
    return 'Contratar';
  };

  // Gerar features dinâmicas para plano pago
  const displayFeatures = isPaidPlan && quantity > 0 ? ['Agendamentos ilimitados', 'Pacientes ilimitados', `${quantity} ${quantity === 1 ? 'profissional' : 'profissionais'}`, 'Procedimentos ilimitados', 'Acesso completo ao prontuário eletrônico', 'Suporte prioritário'] : features;
  return <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && billingPeriod === 'annual' && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-600 text-white">
          💰 Mais Econômico
        </Badge>}
      
      {isCurrentPlan && <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
          Plano Atual
        </Badge>}
      
      {billingPeriod && <Badge variant="outline" className="absolute -top-3 left-4 bg-sky-300">
          {billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}
        </Badge>}
      
      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preço */}
        <div className="text-center py-4 bg-muted/30 rounded-lg">
          {!isPaidPlan ? <div className="text-5xl font-bold text-foreground">Gratuito</div> : <>
              <div className="text-5xl font-bold text-foreground">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-sm text-muted-foreground mt-2">por {period}</p>
            </>}
        </div>

        {/* Seletor de Quantidade */}
        {isPaidPlan && onQuantityChange && <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <label className="text-sm font-semibold text-foreground mb-3 block text-center">
              Número de Profissionais
            </label>
            <div className="flex items-center justify-center gap-3">
              <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                -
              </Button>
              <div className="w-20 text-center">
                <input type="number" min="1" max={maxQuantity} value={quantity} onChange={e => {
              const val = parseInt(e.target.value) || 1;
              onQuantityChange(Math.min(maxQuantity, Math.max(1, val)));
            }} className="w-full text-center text-2xl font-bold border-0 bg-transparent focus:outline-none focus:ring-0" />
              </div>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))} disabled={quantity >= maxQuantity}>
                +
              </Button>
            </div>
          </div>}

        {/* Features */}
        <ul className="space-y-3">
          {displayFeatures.map((feature, index) => <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>)}
        </ul>
        
        {/* Botão */}
        <Button className="w-full mt-6 h-12 text-base font-semibold" variant={isCurrentPlan && !isPaidPlan ? "outline" : "default"} onClick={onSubscribe} disabled={isCurrentPlan && !isPaidPlan || loading}>
          {loading ? <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processando...
            </> : getButtonText()}
        </Button>
      </CardContent>
    </Card>;
}
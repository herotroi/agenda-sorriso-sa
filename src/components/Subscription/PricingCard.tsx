
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
  maxQuantity?: number;
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
  maxQuantity = 10
}: PricingCardProps) {
  const isPaidPlan = price > 0 || unitPrice > 0;
  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Mais Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-green-500">
          Plano Atual
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="mt-4">
          {!isPaidPlan ? (
            <span className="text-4xl font-bold">Gratuito</span>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-1">
                R$ {unitPrice.toFixed(2)} por profissional
              </div>
              <span className="text-4xl font-bold">R$ {price.toFixed(2)}</span>
              <span className="text-muted-foreground">/{period}</span>
              {quantity > 1 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Total: {quantity} profissional{quantity > 1 ? 'is' : ''}
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isPaidPlan && onQuantityChange && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Quantidade de Profissionais
            </label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  onQuantityChange(Math.min(maxQuantity, Math.max(1, val)));
                }}
                className="w-20 text-center border rounded-md px-3 py-2"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cada profissional cadastrado ocupa 1 unidade
            </p>
          </div>
        )}
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full mt-6" 
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={onSubscribe}
          disabled={isCurrentPlan || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : isCurrentPlan ? (
            'Plano Atual'
          ) : !isPaidPlan ? (
            'Plano Atual'
          ) : (
            'Contratar'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

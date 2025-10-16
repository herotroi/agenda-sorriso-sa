
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
  unitPrice = 0
}: PricingCardProps) {
  const totalPrice = unitPrice * quantity;
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
              <div className="text-sm text-gray-600 mb-1">
                R$ {unitPrice.toFixed(2)} por profissional/{period}
              </div>
              <span className="text-4xl font-bold">R$ {totalPrice.toFixed(2)}</span>
              <span className="text-gray-600">/{period}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isPaidPlan && onQuantityChange && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                value={quantity}
                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border rounded-md px-3 py-2"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
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


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
  const totalPrice = unitPrice * quantity;
  const savingsPerUnit = quantity > 1 && unitPrice > 0 ? (price / quantity - unitPrice) : 0;

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Mais Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
          Plano Atual
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preço */}
        <div className="text-center">
          {!isPaidPlan ? (
            <div className="text-4xl font-bold">Gratuito</div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-1">
                R$ {unitPrice.toFixed(2)} por profissional
              </div>
              {savingsPerUnit > 0 && (
                <div className="text-xs text-green-600 mb-2">
                  💰 Economize R$ {savingsPerUnit.toFixed(2)} por profissional
                </div>
              )}
            </>
          )}
        </div>

        {/* Seletor de Quantidade */}
        {isPaidPlan && onQuantityChange && (
          <div className="bg-muted/50 rounded-lg p-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block text-center">
              Número de Profissionais
            </label>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
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
                className="w-16 text-center border rounded-md px-2 py-1 font-medium bg-background"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
              >
                +
              </Button>
            </div>
            <div className="text-center border-t pt-3">
              <p className="text-2xl font-bold">
                R$ {totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">total por {period}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <ul className="space-y-2 pt-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Botão */}
        <Button 
          className="w-full mt-4" 
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

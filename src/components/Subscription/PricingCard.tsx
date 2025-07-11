
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
}

export function PricingCard({ 
  title, 
  price, 
  period, 
  features, 
  isPopular, 
  isCurrentPlan,
  loading = false,
  onSubscribe 
}: PricingCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
          Mais Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">R$ {price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
          ) : (
            'Assinar Agora'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

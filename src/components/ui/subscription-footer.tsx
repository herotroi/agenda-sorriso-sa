import { Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SubscriptionFooterProps {
  subscriptionData: any;
  currentCount: number;
  maxCount?: number;
  featureName: string;
  canUseFeature: boolean;
}

export function SubscriptionFooter({ 
  subscriptionData, 
  currentCount, 
  maxCount, 
  featureName, 
  canUseFeature 
}: SubscriptionFooterProps) {
  if (!subscriptionData) return null;

  const planName = subscriptionData.hasAutomacao ? 'Ilimitado' : 
    subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1);

  return (
    <Card className="border-l-4 border-l-green-500 bg-green-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-green-900">
                  Plano Atual: {planName}
                </p>
                <Badge variant="default" className="bg-blue-600 text-xs">
                  Ativo
                </Badge>
              </div>
              <p className="text-sm text-green-700">
                Acesso completo ao prontuário eletrônico
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-green-900">
              {featureName}: {currentCount}
              {maxCount && maxCount !== -1 && !subscriptionData.hasAutomacao && ` / ${maxCount}`}
            </p>
            <p className="text-xs text-green-600">
              {subscriptionData.hasAutomacao ? 'Ilimitado' : `${maxCount && maxCount !== -1 ? maxCount - currentCount : '∞'} restantes`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
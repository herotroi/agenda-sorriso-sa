
import { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoupons } from '@/hooks/useCoupons';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

export function CouponSection() {
  const [couponCode, setCouponCode] = useState('');
  const { validateAndUseCoupon, loading } = useCoupons();
  const { subscriptionData, refreshSubscriptionData } = useSubscriptionLimits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const success = await validateAndUseCoupon(couponCode.trim());
    if (success) {
      setCouponCode('');
      // Refresh subscription data to reflect changes
      setTimeout(() => {
        refreshSubscriptionData();
      }, 1000);
    }
  };

  if (subscriptionData?.hasAutomacao) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Cupom de Desconto
          </CardTitle>
          <CardDescription>
            Sua conta possui acesso ilimitado ativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Gift className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Acesso Ilimitado Ativo
                </p>
                <p className="text-sm text-green-700">
                  Você tem acesso completo a todas as funcionalidades da plataforma
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="h-5 w-5 mr-2" />
          Cupom de Desconto
        </CardTitle>
        <CardDescription>
          Possui um cupom? Digite aqui para ativar benefícios especiais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="couponCode">Código do Cupom</Label>
            <Input
              id="couponCode"
              type="text"
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={!couponCode.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validando Cupom...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Aplicar Cupom
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Dica:</strong> Cupons especiais oferecem acesso ilimitado a todas as funcionalidades da plataforma, incluindo criação ilimitada de pacientes, profissionais, procedimentos e acesso completo ao prontuário eletrônico.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

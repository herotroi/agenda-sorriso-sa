
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useCoupons() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const validateAndUseCoupon = async (couponCode: string) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      // Verificar se o cupom existe e está ativo
      const { data: coupon, error: couponError } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', couponCode)
        .eq('ativo', true)
        .single();

      if (couponError || !coupon) {
        toast({
          title: 'Cupom Inválido',
          description: 'Cupom não encontrado ou inativo',
          variant: 'destructive',
        });
        return false;
      }

      // Verificar se ainda tem usos disponíveis
      if (coupon.uso_atual >= coupon.limite_uso) {
        toast({
          title: 'Cupom Esgotado',
          description: 'Este cupom já atingiu seu limite de uso',
          variant: 'destructive',
        });
        return false;
      }

      // Verificar se o usuário já tem automação ativa
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('automacao')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Erro',
          description: 'Erro ao verificar perfil do usuário',
          variant: 'destructive',
        });
        return false;
      }

      if (profile.automacao) {
        toast({
          title: 'Cupom já Utilizado',
          description: 'Sua conta já possui acesso ilimitado ativo',
          variant: 'destructive',
        });
        return false;
      }

      // Ativar automação no perfil do usuário
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ automacao: true })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError);
        toast({
          title: 'Erro',
          description: 'Erro ao ativar acesso ilimitado',
          variant: 'destructive',
        });
        return false;
      }

      // Incrementar contador de uso do cupom
      const { error: updateCouponError } = await supabase
        .from('cupons')
        .update({ uso_atual: coupon.uso_atual + 1 })
        .eq('id', coupon.id);

      if (updateCouponError) {
        console.error('Error updating coupon usage:', updateCouponError);
        // Não falha a operação se não conseguir atualizar o contador
      }

      toast({
        title: 'Cupom Aplicado com Sucesso!',
        description: 'Sua conta agora possui acesso ilimitado a todas as funcionalidades',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao validar cupom',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    validateAndUseCoupon,
    loading
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionLimits {
  max_appointments: number;
  max_patients: number;
  max_professionals: number;
  max_procedures: number;
  has_ehr_access: boolean;
}

interface UsageStats {
  appointments_count: number;
  patients_count: number;
  professionals_count: number;
  procedures_count: number;
}

interface SubscriptionData {
  plan_type: string;
  status: string;
  limits: SubscriptionLimits;
  usage: UsageStats;
  canCreateAppointment: boolean;
  canCreatePatient: boolean;
  canCreateProfessional: boolean;
  canCreateProcedure: boolean;
  hasEHRAccess: boolean;
  hasAutomacao: boolean;
}

export function useSubscriptionLimits() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching subscription data for user:', user.id);

      // Tentar sincronizar com Stripe primeiro
      try {
        await supabase.functions.invoke('sync-subscription');
      } catch (syncError) {
        console.log('Sync error (não crítico):', syncError);
      }

      // Buscar perfil do usuário para verificar automação
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('automacao')
        .eq('id', user.id)
        .single();

      const hasAutomacao = profile?.automacao || false;
      console.log('User has automacao:', hasAutomacao);

      // Se tem automação, retorna acesso ilimitado
      if (hasAutomacao) {
        const unlimitedData: SubscriptionData = {
          plan_type: 'unlimited',
          status: 'active',
          limits: {
            max_appointments: -1,
            max_patients: -1,
            max_professionals: -1,
            max_procedures: -1,
            has_ehr_access: true
          },
          usage: {
            appointments_count: 0,
            patients_count: 0,
            professionals_count: 0,
            procedures_count: 0
          },
          canCreateAppointment: true,
          canCreatePatient: true,
          canCreateProfessional: true,
          canCreateProcedure: true,
          hasEHRAccess: true,
          hasAutomacao: true
        };
        setSubscriptionData(unlimitedData);
        setLoading(false);
        return;
      }

      // Buscar assinatura do usuário
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, professionals_purchased')
        .eq('user_id', user.id)
        .single();

      let finalSubscription = subscription;

      if (subError && subError.code === 'PGRST116') {
        console.log('No subscription found, creating free subscription');
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active'
          });

        if (insertError) {
          console.error('Error creating free subscription:', insertError);
          throw insertError;
        }
        
        const { data: newSub, error: newSubError } = await supabase
          .from('user_subscriptions')
          .select('plan_type, status, professionals_purchased')
          .eq('user_id', user.id)
          .single();

        if (newSubError) {
          console.error('Error fetching new subscription:', newSubError);
          throw newSubError;
        }
        
        finalSubscription = newSub;
      } else if (subError) {
        console.error('Error fetching subscription:', subError);
        throw subError;
      }

      // Buscar limites do plano
      const { data: limits, error: limitsError } = await supabase
        .from('subscription_limits')
        .select('*')
        .eq('plan_type', finalSubscription?.plan_type || 'free')
        .single();

      if (limitsError) {
        console.error('Error fetching subscription limits:', limitsError);
        throw limitsError;
      }

      // Buscar estatísticas de uso
      const { data: usage, error: usageError } = await supabase
        .rpc('get_user_usage_stats', { p_user_id: user.id });

      if (usageError) {
        console.error('Error fetching usage stats:', usageError);
        throw usageError;
      }

      const usageStats = usage && usage[0] ? usage[0] : {
        appointments_count: 0,
        patients_count: 0,
        professionals_count: 0,
        procedures_count: 0
      };

      console.log('Usage stats:', usageStats);
      console.log('Limits:', limits);

      // Calcular limite de profissionais baseado na quantidade comprada
      const professionalsPurchased = finalSubscription?.professionals_purchased || 1;
      const maxProfessionals = limits.max_professionals === -1 ? -1 : professionalsPurchased;
      
      // Atualizar os limites para refletir a quantidade comprada
      const updatedLimits = {
        ...limits,
        max_professionals: maxProfessionals
      };

      const subscriptionInfo: SubscriptionData = {
        plan_type: finalSubscription?.plan_type || 'free',
        status: finalSubscription?.status || 'active',
        limits: updatedLimits,
        usage: usageStats,
        canCreateAppointment: updatedLimits.max_appointments === -1 || usageStats.appointments_count < updatedLimits.max_appointments,
        canCreatePatient: updatedLimits.max_patients === -1 || usageStats.patients_count < updatedLimits.max_patients,
        canCreateProfessional: maxProfessionals === -1 || usageStats.professionals_count < maxProfessionals,
        canCreateProcedure: updatedLimits.max_procedures === -1 || usageStats.procedures_count < updatedLimits.max_procedures,
        hasEHRAccess: updatedLimits.has_ehr_access,
        hasAutomacao: hasAutomacao
      };

      console.log('Final subscription info:', subscriptionInfo);
      setSubscriptionData(subscriptionInfo);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados da assinatura',
        variant: 'destructive',
      });
      
      setSubscriptionData({
        plan_type: 'free',
        status: 'active',
        limits: {
          max_appointments: 50,
          max_patients: 10,
          max_professionals: 1,
          max_procedures: 5,
          has_ehr_access: false
        },
        usage: {
          appointments_count: 0,
          patients_count: 0,
          professionals_count: 0,
          procedures_count: 0
        },
        canCreateAppointment: true,
        canCreatePatient: true,
        canCreateProfessional: true,
        canCreateProcedure: true,
        hasEHRAccess: false,
        hasAutomacao: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const checkLimit = (type: 'appointment' | 'patient' | 'professional' | 'procedure' | 'ehr') => {
    if (!subscriptionData) return false;

    // Se tem automação, sempre permite
    if (subscriptionData.hasAutomacao) return true;

    switch (type) {
      case 'appointment':
        return subscriptionData.canCreateAppointment;
      case 'patient':
        return subscriptionData.canCreatePatient;
      case 'professional':
        return subscriptionData.canCreateProfessional;
      case 'procedure':
        return subscriptionData.canCreateProcedure;
      case 'ehr':
        return subscriptionData.hasEHRAccess;
      default:
        return false;
    }
  };

  const showLimitWarning = (type: 'appointment' | 'patient' | 'professional' | 'procedure' | 'ehr') => {
    const professionalLimit = subscriptionData?.plan_type === 'free' 
      ? '1 profissional' 
      : `${subscriptionData?.limits.max_professionals === -1 ? 'profissionais ilimitados' : `${subscriptionData?.limits.max_professionals || 1} profissionais`}`;

    const messages = {
      appointment: 'Você atingiu o limite de agendamentos do seu plano.',
      patient: 'Você atingiu o limite de pacientes do seu plano.',
      professional: `Você atingiu o limite de profissionais do seu plano (${professionalLimit}). Faça upgrade para adicionar mais profissionais.`,
      procedure: 'Você atingiu o limite de procedimentos do seu plano.',
      ehr: 'O prontuário eletrônico não está disponível no plano gratuito.'
    };

    toast({
      title: 'Limite Atingido',
      description: `${messages[type]} Considere fazer upgrade para um plano pago para ter acesso ilimitado.`,
      variant: 'destructive',
      duration: 8000,
    });
  };

  return {
    subscriptionData,
    loading,
    checkLimit,
    showLimitWarning,
    refreshSubscriptionData: fetchSubscriptionData
  };
}


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
      // Buscar assinatura do usuário
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        // Se não encontrar assinatura, criar uma gratuita
        await supabase.from('user_subscriptions').insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active'
        });
        
        // Buscar novamente
        const { data: newSub } = await supabase
          .from('user_subscriptions')
          .select('plan_type, status')
          .eq('user_id', user.id)
          .single();
        
        subscription = newSub;
      }

      // Buscar limites do plano
      const { data: limits, error: limitsError } = await supabase
        .from('subscription_limits')
        .select('*')
        .eq('plan_type', subscription?.plan_type || 'free')
        .single();

      if (limitsError) throw limitsError;

      // Buscar estatísticas de uso
      const { data: usage, error: usageError } = await supabase
        .rpc('get_user_usage_stats', { p_user_id: user.id });

      if (usageError) throw usageError;

      const usageStats = usage[0] || {
        appointments_count: 0,
        patients_count: 0,
        professionals_count: 0,
        procedures_count: 0
      };

      const subscriptionInfo: SubscriptionData = {
        plan_type: subscription?.plan_type || 'free',
        status: subscription?.status || 'active',
        limits: limits,
        usage: usageStats,
        canCreateAppointment: limits.max_appointments === -1 || usageStats.appointments_count < limits.max_appointments,
        canCreatePatient: limits.max_patients === -1 || usageStats.patients_count < limits.max_patients,
        canCreateProfessional: limits.max_professionals === -1 || usageStats.professionals_count < limits.max_professionals,
        canCreateProcedure: limits.max_procedures === -1 || usageStats.procedures_count < limits.max_procedures,
        hasEHRAccess: limits.has_ehr_access
      };

      setSubscriptionData(subscriptionInfo);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados da assinatura',
        variant: 'destructive',
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
    const messages = {
      appointment: 'Você atingiu o limite de agendamentos do seu plano gratuito (50 agendamentos).',
      patient: 'Você atingiu o limite de pacientes do seu plano gratuito (10 pacientes).',
      professional: 'Você atingiu o limite de profissionais do seu plano gratuito (1 profissional).',
      procedure: 'Você atingiu o limite de procedimentos do seu plano gratuito (5 procedimentos).',
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

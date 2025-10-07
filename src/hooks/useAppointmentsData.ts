
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment } from '@/types/prontuario';

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAppointments = async (patientId: string) => {
    if (!patientId || !user) {
      console.error('Tentativa de buscar agendamentos sem autenticação ou ID do paciente');
      return;
    }
    
    setLoading(true);
    try {
      // Primeiro verifica se o paciente pertence ao usuário
      const { data: patientCheck } = await supabase
        .from('patients')
        .select('id')
        .eq('id', patientId)
        .eq('user_id', user.id)
        .single();

      if (!patientCheck) {
        throw new Error('Você não tem permissão para acessar este paciente');
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          procedures(name),
          professionals(name)
        `)
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      
      // Mapear dados para garantir consistência
      const mappedAppointments = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0]
      })) as Appointment[];
      
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    fetchAppointments,
    setAppointments,
  };
}

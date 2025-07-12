
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
    if (!patientId || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          notes,
          price,
          procedures(name),
          professionals(name)
        `)
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
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

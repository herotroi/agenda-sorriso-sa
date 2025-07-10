
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/components/Appointments/types';

export function useProfessionalDetailData(professionalId: string, selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      
      // If no custom date range is provided, fetch the entire month
      let start: Date;
      let end: Date;
      
      if (startDate && endDate) {
        start = startDate;
        end = endDate;
      } else {
        // Get the first day of the month
        start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        
        // Get the last day of the month
        end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color)
        `)
        .eq('professional_id', professionalId)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time');

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

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, professionalId]);

  return {
    appointments,
    loading,
    fetchAppointments
  };
}

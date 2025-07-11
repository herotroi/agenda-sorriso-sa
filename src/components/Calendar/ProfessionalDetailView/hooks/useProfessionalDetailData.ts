
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/components/Appointments/types';

export function useProfessionalDetailData(professionalId: string, selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async (specificDate?: Date) => {
    const targetDate = specificDate || selectedDate;
    console.log('🔄 Fetching professional appointments:', { professionalId, targetDate });
    
    try {
      setLoading(true);
      
      // Buscar apenas para o dia específico
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('📅 Professional detail date range:', { 
        start: startOfDay.toISOString(), 
        end: endOfDay.toISOString(),
        professionalId 
      });

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
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      
      console.log('✅ Professional appointments fetched:', data?.length || 0);
      console.log('📋 Professional appointments data:', data);
      
      setAppointments(data || []);
    } catch (error) {
      console.error('❌ Error fetching professional appointments:', error);
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
    if (professionalId) {
      fetchAppointments();
    }
  }, [selectedDate, professionalId]);

  return {
    appointments,
    loading,
    fetchAppointments
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '../types';

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    console.log('🔄 Fetching appointments data...');
    setRefreshing(true);
    try {
      const appointmentsRes = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color)
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      if (appointmentsRes.error) throw appointmentsRes.error;

      console.log('✅ Data fetched successfully:', {
        appointments: appointmentsRes.data?.length
      });

      setAppointments(appointmentsRes.data || []);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRefresh = () => {
    fetchData();
  };

  return {
    appointments,
    setAppointments,
    loading,
    refreshing,
    handleManualRefresh
  };
}

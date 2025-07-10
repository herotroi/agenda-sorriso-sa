
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '../types';

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    console.log('🔄 Fetching appointments data...');
    setRefreshing(true);
    try {
      const [appointmentsRes, professionalsRes, proceduresRes, statusesRes] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            *,
            patients(full_name),
            professionals(name),
            procedures(name),
            appointment_statuses(label, color)
          `)
          .order('start_time', { ascending: false })
          .limit(50),
        supabase.from('professionals').select('*').eq('active', true),
        supabase.from('procedures').select('*').eq('active', true),
        supabase.from('appointment_statuses').select('*').eq('active', true)
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (proceduresRes.error) throw proceduresRes.error;
      if (statusesRes.error) throw statusesRes.error;

      console.log('✅ Data fetched successfully:', {
        appointments: appointmentsRes.data?.length,
        professionals: professionalsRes.data?.length,
        procedures: proceduresRes.data?.length,
        statuses: statusesRes.data?.length
      });

      setAppointments(appointmentsRes.data || []);
      setProfessionals(professionalsRes.data || []);
      setProcedures(proceduresRes.data || []);
      setStatuses(statusesRes.data || []);
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
    professionals,
    procedures,
    statuses,
    refreshing,
    handleManualRefresh
  };
}

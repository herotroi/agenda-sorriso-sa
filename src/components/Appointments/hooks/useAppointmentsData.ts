
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '../types';

interface AppointmentFilters {
  statusId?: number;
  procedureId?: string;
}

export function useAppointmentsData() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<AppointmentFilters>({});
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
          professionals(
            name,
            break_times,
            vacation_active,
            vacation_start,
            vacation_end
          ),
          procedures(name),
          appointment_statuses(label, color)
        `)
        .order('start_time', { ascending: false })
        .limit(200);

      if (appointmentsRes.error) throw appointmentsRes.error;

      console.log('✅ Data fetched successfully:', {
        appointments: appointmentsRes.data?.length,
        firstAppointment: appointmentsRes.data?.[0]
      });

      const fetchedAppointments = appointmentsRes.data || [];
      setAllAppointments(fetchedAppointments);
      applyFilters(fetchedAppointments, filters);
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

  const applyFilters = (appointmentsList: Appointment[], currentFilters: AppointmentFilters) => {
    let filtered = [...appointmentsList];

    // Filter by status
    if (currentFilters.statusId) {
      filtered = filtered.filter(appointment => 
        appointment.status_id === currentFilters.statusId
      );
    }

    // Filter by procedure
    if (currentFilters.procedureId) {
      filtered = filtered.filter(appointment => 
        appointment.procedure_id === currentFilters.procedureId
      );
    }

    console.log('🔍 Filters applied:', {
      total: appointmentsList.length,
      filtered: filtered.length,
      filters: currentFilters
    });

    setAppointments(filtered);
  };

  const handleFiltersChange = (newFilters: AppointmentFilters) => {
    console.log('🔄 Filters changed:', newFilters);
    setFilters(newFilters);
    applyFilters(allAppointments, newFilters);
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
    handleManualRefresh,
    handleFiltersChange,
    activeFilters: filters,
  };
}

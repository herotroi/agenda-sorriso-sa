
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';

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
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    console.log('🔄 Fetching appointments data...');
    setRefreshing(true);
    try {
      // Buscar o status de "Cancelado"
      const { data: statuses } = await supabase
        .from('appointment_statuses')
        .select('id, key')
        .eq('key', 'cancelled')
        .single();

      const appointmentsRes = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color, key)
        `)
        .eq('user_id', user.id)
        .neq('status_id', statuses?.id || 999) // Excluir cancelados
        .order('start_time', { ascending: false })
        .limit(200);

      if (appointmentsRes.error) throw appointmentsRes.error;

      console.log('✅ Data fetched successfully:', {
        appointments: appointmentsRes.data?.length,
        firstAppointment: appointmentsRes.data?.[0]
      });

      const fetchedAppointments = appointmentsRes.data || [];
      
      // Mapear dados para garantir consistência
      const mappedAppointments = fetchedAppointments.map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0]
      })) as Appointment[];
      
      setAllAppointments(mappedAppointments);
      applyFilters(mappedAppointments, filters);
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
  }, [user]);

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

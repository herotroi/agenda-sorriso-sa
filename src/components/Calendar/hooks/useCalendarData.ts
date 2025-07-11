
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/components/Appointments/types';

interface Professional {
  id: string;
  name: string;
  color: string;
}

export function useCalendarData(selectedDate: Date) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchAppointments = async () => {
    console.log('🔄 Fetching appointments for date:', selectedDate);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('📅 Date range:', { 
        start: startOfDay.toISOString(), 
        end: endOfDay.toISOString(),
        selectedDate: selectedDate.toDateString()
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
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      
      console.log('✅ Appointments fetched:', data?.length || 0);
      console.log('📋 Appointments data:', data);
      
      setAppointments(data || []);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTimeConflicts = async (
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, patients(full_name)')
        .eq('professional_id', professionalId)
        .neq('status', 'Cancelado')
        .gte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T00:00:00')
        .lte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T23:59:59');

      if (error) throw error;

      const conflicts = data?.filter(appointment => {
        if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
          return false;
        }

        const existingStart = new Date(appointment.start_time);
        const existingEnd = new Date(appointment.end_time);
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (conflicts && conflicts.length > 0) {
        console.warn('⚠️ Time conflict detected:', conflicts);
        toast({
          title: 'Conflito de Horário',
          description: `Este horário já está ocupado para este profissional às ${new Date(conflicts[0].start_time).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}.`,
          variant: 'destructive',
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking time conflicts:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const refreshAppointments = () => {
    fetchAppointments();
  };

  return {
    professionals,
    appointments,
    loading,
    refreshAppointments,
    checkTimeConflicts
  };
}


import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchAppointments } from './utils/appointmentUtils';
import { Appointment } from '@/components/Appointments/types';

export function useAppointments(selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments(selectedDate);
      setAppointments(data);
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

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  return {
    appointments,
    loading,
    refreshAppointments: loadAppointments
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';

type AppointmentStatus = 'confirmado' | 'cancelado' | 'faltou' | 'em-andamento' | 'concluido';

export function useProfessionalDetailData(professionalId: string, selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper function to map status
  const mapStatus = (status: string | null): AppointmentStatus => {
    if (!status) return 'confirmado';
    const validStatuses: AppointmentStatus[] = ['confirmado', 'cancelado', 'faltou', 'em-andamento', 'concluido'];
    return validStatuses.includes(status as AppointmentStatus) ? status as AppointmentStatus : 'confirmado';
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Appointment clicked:', appointment);
    // Add any additional logic for appointment click handling here
  };

  const fetchAppointments = async (specificDate?: Date) => {
    if (!user) return;
    
    const targetDate = specificDate || selectedDate;
    console.log('🔄 Fetching professional appointments:', { professionalId, targetDate });
    
    try {
      setLoading(true);
      
      // Buscar apenas para o dia específico (para visualização do dia)
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
        .eq('user_id', user.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      
      console.log('✅ Professional appointments fetched:', data?.length || 0);
      console.log('📋 Professional appointments data:', data);
      
      // Map database fields to frontend interface
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        id: apt.id,
        professionalId: apt.professional_id,
        patientId: apt.patient_id,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        startTime: apt.start_time,
        endTime: apt.end_time,
        procedureId: apt.procedure_id,
        status: mapStatus(apt.status),
        notes: apt.notes,
        createdAt: apt.created_at || new Date().toISOString(),
        // Database fields
        created_at: apt.created_at,
        end_time: apt.end_time,
        patient_id: apt.patient_id,
        price: apt.price,
        procedure_id: apt.procedure_id,
        professional_id: apt.professional_id,
        start_time: apt.start_time,
        status_id: apt.status_id,
        updated_at: apt.updated_at,
        user_id: apt.user_id,
        // Joined table fields
        patients: apt.patients,
        professionals: apt.professionals,
        procedures: apt.procedures,
        appointment_statuses: apt.appointment_statuses
      }));
      
      setAppointments(mappedAppointments);
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

  const fetchMonthAppointments = async (date: Date) => {
    if (!user) return;
    
    try {
      // Buscar todos os agendamentos do mês
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

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
        .eq('user_id', user.id)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())
        .order('start_time');

      if (error) throw error;
      
      // Map database fields to frontend interface
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        id: apt.id,
        professionalId: apt.professional_id,
        patientId: apt.patient_id,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        startTime: apt.start_time,
        endTime: apt.end_time,
        procedureId: apt.procedure_id,
        status: mapStatus(apt.status),
        notes: apt.notes,
        createdAt: apt.created_at || new Date().toISOString(),
        // Database fields
        created_at: apt.created_at,
        end_time: apt.end_time,
        patient_id: apt.patient_id,
        price: apt.price,
        procedure_id: apt.procedure_id,
        professional_id: apt.professional_id,
        start_time: apt.start_time,
        status_id: apt.status_id,
        updated_at: apt.updated_at,
        user_id: apt.user_id,
        // Joined table fields
        patients: apt.patients,
        professionals: apt.professionals,
        procedures: apt.procedures,
        appointment_statuses: apt.appointment_statuses
      }));
      
      setMonthAppointments(mappedAppointments);
    } catch (error) {
      console.error('❌ Error fetching month appointments:', error);
    }
  };

  useEffect(() => {
    if (professionalId && user) {
      fetchAppointments();
      fetchMonthAppointments(selectedDate);
    }
  }, [selectedDate, professionalId, user]);

  return {
    appointments,
    monthAppointments,
    loading,
    fetchAppointments,
    handleAppointmentClick
  };
}

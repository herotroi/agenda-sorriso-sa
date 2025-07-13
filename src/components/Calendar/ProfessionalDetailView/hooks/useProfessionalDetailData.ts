
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';

export function useProfessionalDetailData(professionalId: string, selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

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
      const mappedAppointments = (data || []).map(apt => ({
        ...apt,
        startTime: apt.start_time,
        endTime: apt.end_time,
        patientId: apt.patient_id,
        professionalId: apt.professional_id,
        procedureId: apt.procedure_id,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        createdAt: apt.created_at || new Date().toISOString()
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
      const mappedAppointments = (data || []).map(apt => ({
        ...apt,
        startTime: apt.start_time,
        endTime: apt.end_time,
        patientId: apt.patient_id,
        professionalId: apt.professional_id,
        procedureId: apt.procedure_id,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        createdAt: apt.created_at || new Date().toISOString()
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
    fetchAppointments
  };
}

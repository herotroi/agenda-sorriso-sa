
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';
import { isDateInVacationPeriod } from '@/utils/vacationDateUtils';

type AppointmentStatus = 'confirmado' | 'cancelado' | 'faltou' | 'em-andamento' | 'concluido';

export function useProfessionalDetailData(professionalId: string, selectedDate: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const mapStatus = (status: string | null): AppointmentStatus => {
    if (!status) return 'confirmado';
    const validStatuses: AppointmentStatus[] = ['confirmado', 'cancelado', 'faltou', 'em-andamento', 'concluido'];
    return validStatuses.includes(status as AppointmentStatus) ? status as AppointmentStatus : 'confirmado';
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Appointment clicked:', appointment);
  };

  const fetchProfessionalData = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', professionalId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching professional data:', error);
      return null;
    }
  };

  const createVacationItems = (professional: any, targetDate: Date, forMonth: boolean = false) => {
    const items: any[] = [];
    
    if (professional.vacation_active && professional.vacation_start && professional.vacation_end) {
      if (forMonth) {
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        
        // Obter todos os dias do mês
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(targetYear, targetMonth, day);
          
          // Verificar se este dia está dentro do período de férias
          if (isDateInVacationPeriod(currentDate, professional.vacation_start, professional.vacation_end)) {
            items.push({
              id: `vacation-${professional.id}-${currentDate.getTime()}`,
              type: 'vacation',
              professional_id: professional.id,
              start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0).toISOString(),
              end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59).toISOString(),
              notes: 'Férias',
              status: 'vacation',
              patients: { full_name: '🏖️ FÉRIAS' },
              professionals: { name: professional.name },
              procedures: { name: '-' },
              appointment_statuses: { label: 'Férias', color: '#f59e0b' }
            });
          }
        }
      } else {
        // Para visão diária - verificar se o dia específico está em férias
        if (isDateInVacationPeriod(targetDate, professional.vacation_start, professional.vacation_end)) {
          items.push({
            id: `vacation-${professional.id}-${targetDate.getTime()}`,
            type: 'vacation',
            professional_id: professional.id,
            start_time: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0).toISOString(),
            end_time: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59).toISOString(),
            notes: 'Férias',
            status: 'vacation',
            patients: { full_name: '🏖️ FÉRIAS' },
            professionals: { name: professional.name },
            procedures: { name: '-' },
            appointment_statuses: { label: 'Férias', color: '#f59e0b' }
          });
        }
      }
    }
    
    return items;
  };

  const createBreakItems = (professional: any, targetDate: Date, forMonth: boolean = false) => {
    const items: any[] = [];
    
    if (professional.break_times) {
      let breakTimes = [];
      try {
        if (Array.isArray(professional.break_times)) {
          breakTimes = professional.break_times;
        } else if (typeof professional.break_times === 'string') {
          breakTimes = JSON.parse(professional.break_times);
        }
      } catch (e) {
        console.warn('Failed to parse break_times:', e);
        return items;
      }
      
      if (breakTimes.length > 0) {
        const validBreaks = breakTimes.filter(bt => bt && bt.start && bt.end);
        
        if (forMonth) {
          // Para visão mensal - não mostrar pausas no calendário, apenas quando clicar no dia
          // Por isso retornamos array vazio aqui
          return items;
        } else {
          // Para visão diária - verificar se é dia de trabalho
          const dayOfWeek = targetDate.getDay();
          const workingDays = professional.working_days || [true, true, true, true, true, false, false];
          
          // Verificar se é um dia de trabalho normal ou fim de semana com expediente
          const isNormalWorkingDay = workingDays[dayOfWeek];
          const isWeekendWithShift = professional.weekend_shift_active && (dayOfWeek === 0 || dayOfWeek === 6);
          
          if (isNormalWorkingDay || isWeekendWithShift) {
            validBreaks.forEach((breakTime, index) => {
              const [startHour, startMinute] = breakTime.start.split(':').map(Number);
              const [endHour, endMinute] = breakTime.end.split(':').map(Number);
              
              const startDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                           startHour, startMinute, 0);
              const endDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                         endHour, endMinute, 0);
              
              items.push({
                id: `break-${professional.id}-${index}-${targetDate.getTime()}`,
                type: 'break',
                professional_id: professional.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                notes: 'Pausa/Intervalo',
                status: 'break',
                patients: { full_name: '☕ PAUSA' },
                professionals: { name: professional.name },
                procedures: { name: '-' },
                appointment_statuses: { label: 'Pausa', color: '#6b7280' }
              });
            });
          }
        }
      }
    }
    
    return items;
  };

  // Nova função para criar itens de pausa apenas para um dia específico (usado no lado direito da visão mensal)
  const createBreakItemsForSpecificDay = (professional: any, targetDate: Date) => {
    const items: any[] = [];
    
    if (professional.break_times) {
      let breakTimes = [];
      try {
        if (Array.isArray(professional.break_times)) {
          breakTimes = professional.break_times;
        } else if (typeof professional.break_times === 'string') {
          breakTimes = JSON.parse(professional.break_times);
        }
      } catch (e) {
        console.warn('Failed to parse break_times:', e);
        return items;
      }
      
      if (breakTimes.length > 0) {
        const validBreaks = breakTimes.filter(bt => bt && bt.start && bt.end);
        const dayOfWeek = targetDate.getDay();
        const workingDays = professional.working_days || [true, true, true, true, true, false, false];
        
        // Verificar se é um dia de trabalho normal ou fim de semana com expediente
        const isNormalWorkingDay = workingDays[dayOfWeek];
        const isWeekendWithShift = professional.weekend_shift_active && (dayOfWeek === 0 || dayOfWeek === 6);
        
        if (isNormalWorkingDay || isWeekendWithShift) {
          validBreaks.forEach((breakTime, index) => {
            const [startHour, startMinute] = breakTime.start.split(':').map(Number);
            const [endHour, endMinute] = breakTime.end.split(':').map(Number);
            
            const startDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                         startHour, startMinute, 0);
            const endDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                       endHour, endMinute, 0);
            
            items.push({
              id: `break-${professional.id}-${index}-${targetDate.getTime()}`,
              type: 'break',
              professional_id: professional.id,
              start_time: startDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              notes: 'Pausa/Intervalo',
              status: 'break',
              patients: { full_name: '☕ PAUSA' },
              professionals: { name: professional.name },
              procedures: { name: '-' },
              appointment_statuses: { label: 'Pausa', color: '#6b7280' }
            });
          });
        }
      }
    }
    
    return items;
  };

  const fetchAppointments = async (specificDate?: Date) => {
    if (!user) return;
    
    const targetDate = specificDate || selectedDate;
    console.log('🔄 Fetching professional appointments:', { professionalId, targetDate });
    
    try {
      setLoading(true);
      
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('📅 Professional detail date range:', { 
        start: startOfDay.toISOString(), 
        end: endOfDay.toISOString(),
        professionalId 
      });

      // Buscar o status de "Cancelado"
      const { data: statuses } = await supabase
        .from('appointment_statuses')
        .select('id, key')
        .eq('key', 'cancelled')
        .single();

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color, key)
        `)
        .eq('professional_id', professionalId)
        .eq('user_id', user.id)
        .neq('status_id', statuses?.id || 999) // Excluir cancelados
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      
      console.log('✅ Professional appointments fetched:', data?.length || 0);
      
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0]
      }));
      
      const professionalData = await fetchProfessionalData();
      const allItems = [...mappedAppointments];
      
      if (professionalData) {
        const vacationItems = createVacationItems(professionalData, targetDate, false);
        allItems.push(...vacationItems);
        
        const breakItems = createBreakItems(professionalData, targetDate, false);
        allItems.push(...breakItems);
      }
      
      allItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setAppointments(allItems);
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
          appointment_statuses(label, color, key)
        `)
        .eq('professional_id', professionalId)
        .eq('user_id', user.id)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())
        .order('start_time');

      if (error) throw error;
      
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0]
      }));
      
      const professionalData = await fetchProfessionalData();
      const allItems = [...mappedAppointments];
      
      if (professionalData) {
        // Para visão mensal, incluir férias mas não pausas no calendário
        const vacationItems = createVacationItems(professionalData, date, true);
        allItems.push(...vacationItems);
        
        // Não incluir pausas no calendário mensal - elas aparecerão apenas na lista lateral
      }
      
      allItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setMonthAppointments(allItems);
    } catch (error) {
      console.error('❌ Error fetching month appointments:', error);
    }
  };

  // Função para buscar itens de um dia específico incluindo pausas (para a lista lateral)
  const getAppointmentsForSpecificDate = async (date: Date) => {
    if (!user) return [];
    
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color, key)
        `)
        .eq('professional_id', professionalId)
        .eq('user_id', user.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0]
      }));
      
      const professionalData = await fetchProfessionalData();
      const allItems = [...mappedAppointments];
      
      if (professionalData) {
        const vacationItems = createVacationItems(professionalData, date, false);
        allItems.push(...vacationItems);
        
        // Para lista lateral, incluir pausas
        const breakItems = createBreakItemsForSpecificDay(professionalData, date);
        allItems.push(...breakItems);
      }
      
      allItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      return allItems;
    } catch (error) {
      console.error('❌ Error fetching specific date appointments:', error);
      return [];
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
    handleAppointmentClick,
    getAppointmentsForSpecificDate
  };
}

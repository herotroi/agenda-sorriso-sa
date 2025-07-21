
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
    // Implementar lógica adicional conforme necessário
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

  const createVacationItems = (professional: any, targetDate: Date) => {
    const items: any[] = [];
    
    if (professional.vacation_active && professional.vacation_start && professional.vacation_end) {
      const startDate = new Date(professional.vacation_start);
      const endDate = new Date(professional.vacation_end);
      
      // Criar uma entrada para cada dia de férias
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Verificar se é o dia alvo (para visualização diária) ou se está no mês (para visualização mensal)
        const isTargetDay = currentDate.toDateString() === targetDate.toDateString();
        const isInTargetMonth = currentDate.getMonth() === targetDate.getMonth() && 
                               currentDate.getFullYear() === targetDate.getFullYear();
        
        if (isTargetDay || isInTargetMonth) {
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
        
        currentDate.setDate(currentDate.getDate() + 1);
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
        
        validBreaks.forEach((breakTime, index) => {
          if (forMonth) {
            // Para visualização mensal, mostrar pausas para cada dia do mês
            const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
              const breakDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
              
              // Verificar se é um dia de trabalho (assumindo segunda a sexta)
              const dayOfWeek = breakDate.getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Pular fins de semana
              
              const [startHour, startMinute] = breakTime.start.split(':');
              const [endHour, endMinute] = breakTime.end.split(':');
              
              const startDateTime = new Date(breakDate.getFullYear(), breakDate.getMonth(), breakDate.getDate(), 
                                           parseInt(startHour), parseInt(startMinute), 0);
              const endDateTime = new Date(breakDate.getFullYear(), breakDate.getMonth(), breakDate.getDate(), 
                                         parseInt(endHour), parseInt(endMinute), 0);
              
              items.push({
                id: `break-${professional.id}-${index}-${breakDate.getTime()}`,
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
            }
          } else {
            // Para visualização diária, mostrar apenas as pausas do dia específico
            const [startHour, startMinute] = breakTime.start.split(':');
            const [endHour, endMinute] = breakTime.end.split(':');
            
            const startDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                         parseInt(startHour), parseInt(startMinute), 0);
            const endDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 
                                       parseInt(endHour), parseInt(endMinute), 0);
            
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
          }
        });
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
      
      // Mapear dados de agendamentos regulares
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        status: mapStatus(apt.status)
      }));
      
      // Buscar dados do profissional para férias e pausas
      const professionalData = await fetchProfessionalData();
      const allItems = [...mappedAppointments];
      
      if (professionalData) {
        // Adicionar férias
        const vacationItems = createVacationItems(professionalData, targetDate);
        allItems.push(...vacationItems);
        
        // Adicionar pausas
        const breakItems = createBreakItems(professionalData, targetDate, false);
        allItems.push(...breakItems);
      }
      
      // Ordenar todos os itens por horário
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
      
      // Mapear dados de agendamentos regulares
      const mappedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        date: new Date(apt.start_time).toISOString().split('T')[0],
        status: mapStatus(apt.status)
      }));
      
      // Buscar dados do profissional para férias e pausas
      const professionalData = await fetchProfessionalData();
      const allItems = [...mappedAppointments];
      
      if (professionalData) {
        // Adicionar férias
        const vacationItems = createVacationItems(professionalData, date);
        allItems.push(...vacationItems);
        
        // Adicionar pausas
        const breakItems = createBreakItems(professionalData, date, true);
        allItems.push(...breakItems);
      }
      
      // Ordenar todos os itens por horário
      allItems.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      setMonthAppointments(allItems);
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

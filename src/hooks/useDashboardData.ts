import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  todayAppointments: number;
  activePatients: number;
  monthlyRevenue: number;
  occupancyRate: number;
  confirmedCount: number;
  cancelledCount: number;
  noShowCount: number;
  completedCount: number;
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  time: string;
  professional: string;
  type: string;
}

interface PeriodFilter {
  year: number;
  month?: number | 'all';
  day?: number | null;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activePatients: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    completedCount: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(currentYear, 0, 1),
      end: new Date(currentYear, 11, 31, 23, 59, 59)
    };
  });
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>({ 
    year: new Date().getFullYear(), 
    month: 'all', 
    day: null 
  });
  const { toast } = useToast();

  const fetchDashboardData = async (customDateRange?: { start: Date; end: Date }, period?: PeriodFilter) => {
    console.log('🔄 Fetching dashboard data...');
    setLoading(true);
    
    try {
      const range = customDateRange || dateRange;
      const currentPeriod = period || selectedPeriod;
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      // Buscar agendamentos de hoje
      const { data: todayAppointmentsData, error: todayError } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

      if (todayError) throw todayError;

      // Buscar total de pacientes ativos
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (patientsError) throw patientsError;

      // Buscar receita do período selecionado
      const { data: periodAppointments, error: periodError } = await supabase
        .from('appointments')
        .select('price')
        .gte('start_time', range.start.toISOString())
        .lte('start_time', range.end.toISOString())
        .not('price', 'is', null);

      if (periodError) throw periodError;

      const periodRevenue = periodAppointments?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0;

      // Buscar próximos agendamentos
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          patients(full_name),
          professionals(name),
          procedures(name)
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4);

      if (upcomingError) throw upcomingError;

      // Buscar estatísticas por status do período
      const { data: statusStats, error: statusError } = await supabase
        .from('appointments')
        .select('status_id, appointment_statuses(key)')
        .gte('start_time', range.start.toISOString())
        .lte('start_time', range.end.toISOString());

      if (statusError) throw statusError;

      // Contar por status
      const statusCounts = {
        confirmed: 0,
        cancelled: 0,
        no_show: 0,
        completed: 0,
      };

      statusStats?.forEach(appointment => {
        const statusKey = appointment.appointment_statuses?.key;
        if (statusKey && statusKey in statusCounts) {
          statusCounts[statusKey as keyof typeof statusCounts]++;
        }
      });

      // Buscar dados de receita baseado na seleção
      const revenueData = [];
      const startYear = range.start.getFullYear();

      if (currentPeriod.day && currentPeriod.month !== 'all' && typeof currentPeriod.month === 'number') {
        // Dia específico - mostrar dados por hora
        for (let hour = 0; hour < 24; hour++) {
          const startHour = new Date(startYear, currentPeriod.month - 1, currentPeriod.day, hour, 0, 0).toISOString();
          const endHour = new Date(startYear, currentPeriod.month - 1, currentPeriod.day, hour, 59, 59, 999).toISOString();
          
          const { data: hourData, error: hourError } = await supabase
            .from('appointments')
            .select('price')
            .gte('start_time', startHour)
            .lte('start_time', endHour)
            .not('price', 'is', null);

          if (!hourError && hourData) {
            const hourRevenue = hourData.reduce((sum, apt) => sum + (apt.price || 0), 0);
            revenueData.push({
              name: `${hour.toString().padStart(2, '0')}h`,
              value: hourRevenue
            });
          }
        }
      } else if (currentPeriod.month !== 'all' && typeof currentPeriod.month === 'number') {
        // Mês específico - mostrar dados diários
        const daysInMonth = new Date(startYear, currentPeriod.month, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const startDayDate = new Date(startYear, currentPeriod.month - 1, day, 0, 0, 0).toISOString();
          const endDayDate = new Date(startYear, currentPeriod.month - 1, day, 23, 59, 59, 999).toISOString();
          
          const { data: dayData, error: dayError } = await supabase
            .from('appointments')
            .select('price')
            .gte('start_time', startDayDate)
            .lte('start_time', endDayDate)
            .not('price', 'is', null);

          if (!dayError && dayData) {
            const dayRevenue = dayData.reduce((sum, apt) => sum + (apt.price || 0), 0);
            revenueData.push({
              name: day.toString().padStart(2, '0'),
              value: dayRevenue
            });
          }
        }
      } else {
        // Ano completo - mostrar dados mensais
        for (let month = 0; month < 12; month++) {
          const startMonthDate = new Date(startYear, month, 1).toISOString();
          const endMonthDate = new Date(startYear, month + 1, 0, 23, 59, 59, 999).toISOString();
          
          const { data: monthData, error: monthError } = await supabase
            .from('appointments')
            .select('price')
            .gte('start_time', startMonthDate)
            .lte('start_time', endMonthDate)
            .not('price', 'is', null);

          if (!monthError && monthData) {
            const monthRevenue = monthData.reduce((sum, apt) => sum + (apt.price || 0), 0);
            const monthName = new Date(startYear, month).toLocaleDateString('pt-BR', { month: 'short' });
            revenueData.push({
              name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
              value: monthRevenue
            });
          }
        }
      }

      // Calcular taxa de ocupação (simplificada - agendamentos hoje / slots disponíveis)
      const totalSlots = 40; // Assumindo 8 slots por dia para 5 profissionais
      const occupancyRate = Math.round((todayAppointmentsData?.length || 0) / totalSlots * 100);

      setStats({
        todayAppointments: todayAppointmentsData?.length || 0,
        activePatients: patientsCount || 0,
        monthlyRevenue: periodRevenue,
        occupancyRate: Math.min(occupancyRate, 100),
        confirmedCount: statusCounts.confirmed,
        cancelledCount: statusCounts.cancelled,
        noShowCount: statusCounts.no_show,
        completedCount: statusCounts.completed,
      });

      setUpcomingAppointments(
        upcomingData?.map(apt => ({
          id: apt.id,
          patient: apt.patients?.full_name || 'N/A',
          time: new Date(apt.start_time).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          professional: apt.professionals?.name || 'N/A',
          type: apt.procedures?.name || 'N/A',
        })) || []
      );

      setMonthlyRevenueData(revenueData);

      console.log('✅ Dashboard data fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date, period?: PeriodFilter) => {
    const newRange = { start: startDate, end: endDate };
    setDateRange(newRange);
    setSelectedPeriod(period || { year: startDate.getFullYear(), month: 'all', day: null });
    fetchDashboardData(newRange, period);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    upcomingAppointments,
    monthlyRevenueData,
    loading,
    refetch: () => fetchDashboardData(),
    onDateRangeChange: handleDateRangeChange,
    currentDateRange: dateRange,
    selectedPeriod
  };
}

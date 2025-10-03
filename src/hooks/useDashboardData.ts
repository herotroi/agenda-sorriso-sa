
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  todayAppointments: number;
  activePatients: number;
  monthlyRevenue: number;
  cancelledRevenue: number;
  occupancyRate: number;
  confirmedCount: number;
  cancelledCount: number;
  noShowCount: number;
  completedCount: number;
}

interface RevenueData {
  name: string;
  value: number;
}

interface UpcomingAppointment {
  id: string;
  patient: string;
  professional: string;
  type: string;
  time: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activePatients: 0,
    monthlyRevenue: 0,
    cancelledRevenue: 0,
    occupancyRate: 0,
    confirmedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    completedCount: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59),
  });
  const [selectedPeriod, setSelectedPeriod] = useState<{ year: number; month?: number | 'all'; day?: number | null }>({
    year: new Date().getFullYear(),
    month: 'all',
    day: null,
  });
  const { user } = useAuth();

  const fetchStats = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Agendamentos de hoje
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString());

      // Pacientes ativos
      const { count: activePatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('active', true);

      // Query para receita do período - DEVE incluir user_id
      let revenueQuery = supabase
        .from('appointments')
        .select('price, status')
        .eq('user_id', user.id)
        .not('price', 'is', null);

      if (startDate && endDate) {
        revenueQuery = revenueQuery
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { data: revenueData } = await revenueQuery;

      const monthlyRevenue = revenueData?.reduce((sum, appointment) => {
        if (appointment.status !== 'cancelled') {
          return sum + (appointment.price || 0);
        }
        return sum;
      }, 0) || 0;

      const cancelledRevenue = revenueData?.reduce((sum, appointment) => {
        if (appointment.status === 'cancelled') {
          return sum + (appointment.price || 0);
        }
        return sum;
      }, 0) || 0;

      // Contadores por status
      let statusQuery = supabase
        .from('appointments')
        .select('status')
        .eq('user_id', user.id);

      if (startDate && endDate) {
        statusQuery = statusQuery
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { data: statusData } = await statusQuery;

      const confirmedCount = statusData?.filter(a => a.status === 'confirmed').length || 0;
      const cancelledCount = statusData?.filter(a => a.status === 'cancelled').length || 0;
      const noShowCount = statusData?.filter(a => a.status === 'no_show').length || 0;
      const completedCount = statusData?.filter(a => a.status === 'completed').length || 0;

      // Taxa de ocupação (simplificada)
      const totalSlots = 100; // Exemplo
      const occupiedSlots = confirmedCount + completedCount;
      const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

      setStats({
        todayAppointments: todayCount || 0,
        activePatients: activePatients || 0,
        monthlyRevenue,
        cancelledRevenue,
        occupancyRate,
        confirmedCount,
        cancelledCount,
        noShowCount,
        completedCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          patients(full_name),
          professionals(name),
          procedures(name)
        `)
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(5);

      if (data) {
        const appointments = data.map((appointment: any) => ({
          id: appointment.id,
          patient: appointment.patients?.full_name || 'Paciente não informado',
          professional: appointment.professionals?.name || 'Profissional não informado',
          type: appointment.procedures?.name || 'Procedimento não informado',
          time: new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setUpcomingAppointments(appointments);
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const fetchRevenueData = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('appointments')
        .select('start_time, price')
        .eq('user_id', user.id)
        .not('price', 'is', null)
        .neq('status', 'cancelled')
        .order('start_time');

      if (startDate && endDate) {
        query = query
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { data } = await query;

      if (data) {
        // Agrupar por mês se for ano inteiro, por dia se for mês específico
        const groupedData = data.reduce((acc, appointment) => {
          const date = new Date(appointment.start_time);
          let key: string;
          
          if (selectedPeriod.month === 'all') {
            // Agrupar por mês
            key = date.toLocaleDateString('pt-BR', { month: 'short' });
          } else {
            // Agrupar por dia
            key = date.getDate().toString();
          }
          
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += appointment.price || 0;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(groupedData).map(([name, value]) => ({
          name,
          value,
        }));

        setMonthlyRevenueData(chartData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchData = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    await Promise.all([
      fetchStats(startDate, endDate),
      fetchUpcomingAppointments(),
      fetchRevenueData(startDate, endDate),
    ]);
    setLoading(false);
  };

  const onDateRangeChange = (startDate: Date, endDate: Date, period?: { year: number; month?: number | 'all'; day?: number | null }) => {
    setCurrentDateRange({ start: startDate, end: endDate });
    if (period) {
      setSelectedPeriod(period);
    }
    fetchData(startDate.toISOString(), endDate.toISOString());
  };

  const refetch = () => {
    fetchData(currentDateRange.start.toISOString(), currentDateRange.end.toISOString());
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    stats,
    upcomingAppointments,
    monthlyRevenueData,
    loading,
    refetch,
    onDateRangeChange,
    currentDateRange,
    selectedPeriod,
  };
}

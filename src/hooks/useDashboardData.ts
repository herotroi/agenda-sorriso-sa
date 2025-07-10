
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
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    console.log('🔄 Fetching dashboard data...');
    setLoading(true);
    
    try {
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

      // Buscar receita do mês atual
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      
      const { data: monthlyAppointments, error: monthlyError } = await supabase
        .from('appointments')
        .select('price')
        .gte('start_time', startOfMonth)
        .lte('start_time', endOfMonth)
        .not('price', 'is', null);

      if (monthlyError) throw monthlyError;

      const monthlyRevenue = monthlyAppointments?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0;

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

      // Buscar estatísticas por status
      const { data: statusStats, error: statusError } = await supabase
        .from('appointments')
        .select('status_id, appointment_statuses(key)')
        .gte('start_time', startOfMonth)
        .lte('start_time', endOfMonth);

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

      // Buscar dados de receita dos últimos 12 meses
      const monthlyRevenueQuery = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const endMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        
        const { data: monthData, error: monthError } = await supabase
          .from('appointments')
          .select('price')
          .gte('start_time', startMonth)
          .lte('start_time', endMonth)
          .not('price', 'is', null);

        if (!monthError && monthData) {
          const monthRevenue = monthData.reduce((sum, apt) => sum + (apt.price || 0), 0);
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
          monthlyRevenueQuery.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            value: monthRevenue
          });
        }
      }

      // Calcular taxa de ocupação (simplificada - agendamentos hoje / slots disponíveis)
      const totalSlots = 40; // Assumindo 8 slots por dia para 5 profissionais
      const occupancyRate = Math.round((todayAppointmentsData?.length || 0) / totalSlots * 100);

      setStats({
        todayAppointments: todayAppointmentsData?.length || 0,
        activePatients: patientsCount || 0,
        monthlyRevenue,
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

      setMonthlyRevenueData(monthlyRevenueQuery);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    upcomingAppointments,
    monthlyRevenueData,
    loading,
    refetch: fetchDashboardData
  };
}

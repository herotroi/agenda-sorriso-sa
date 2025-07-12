
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingAppointments: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async (startDate?: string, endDate?: string) => {
    if (!user) return;
    
    try {
      // Total de pacientes
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Construir query para agendamentos com filtro de data
      let appointmentsQuery = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (startDate && endDate) {
        appointmentsQuery = appointmentsQuery
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { count: appointmentsCount } = await appointmentsQuery;

      // Query para receita total
      let revenueQuery = supabase
        .from('appointments')
        .select('price')
        .eq('user_id', user.id)
        .not('price', 'is', null);

      if (startDate && endDate) {
        revenueQuery = revenueQuery
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { data: revenueData } = await revenueQuery;

      const totalRevenue = revenueData?.reduce((sum, appointment) => {
        return sum + (appointment.price || 0);
      }, 0) || 0;

      // Agendamentos pendentes (hoje e futuro)
      const today = new Date().toISOString().split('T')[0];
      const { count: pendingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('start_time', today);

      setStats({
        totalPatients: patientsCount || 0,
        totalAppointments: appointmentsCount || 0,
        totalRevenue,
        pendingAppointments: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
        .order('start_time');

      if (startDate && endDate) {
        query = query
          .gte('start_time', startDate)
          .lte('start_time', endDate);
      }

      const { data } = await query;

      if (data) {
        // Agrupar por data
        const groupedData = data.reduce((acc, appointment) => {
          const date = new Date(appointment.start_time).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += appointment.price || 0;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(groupedData).map(([date, revenue]) => ({
          date,
          revenue,
        }));

        setRevenueData(chartData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchData = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    await Promise.all([
      fetchStats(startDate, endDate),
      fetchRevenueData(startDate, endDate),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    stats,
    revenueData,
    loading,
    refetch: fetchData,
  };
}

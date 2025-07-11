import { StatsCard } from '@/components/Dashboard/StatsCard';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/Dashboard/DateRangeSelector';

export default function Dashboard() {
  const { 
    stats, 
    upcomingAppointments, 
    monthlyRevenueData, 
    loading, 
    refetch,
    onDateRangeChange,
    currentDateRange,
    selectedPeriod
  } = useDashboardData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Carregando dados da clínica...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da sua clínica</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector 
        onDateRangeChange={onDateRangeChange}
        selectedYear={currentDateRange.start.getFullYear()}
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Agendamentos Hoje"
          value={stats.todayAppointments}
          icon={Calendar}
        />
        <StatsCard
          title="Pacientes Ativos"
          value={stats.activePatients}
          icon={Users}
        />
        <StatsCard
          title="Receita do Período"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Taxa de Ocupação"
          value={`${stats.occupancyRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart and Upcoming Appointments */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RevenueChart data={monthlyRevenueData} selectedPeriod={selectedPeriod} />
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum agendamento próximo</p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{appointment.patient}</p>
                      <p className="text-xs text-gray-600">{appointment.professional}</p>
                      <p className="text-xs text-gray-500">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{appointment.time}</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelledCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faltaram</p>
                <p className="text-2xl font-bold text-orange-600">{stats.noShowCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

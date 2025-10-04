
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
  RefreshCw,
  TrendingDown,
  CreditCard
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/Dashboard/DateRangeSelector';

export default function Dashboard() {
  const { 
    stats, 
    upcomingAppointments, 
    monthlyRevenueData,
    paymentMethodsData, 
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Visão geral da sua clínica</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector 
        onDateRangeChange={onDateRangeChange}
        selectedYear={currentDateRange.start.getFullYear()}
      />

      {/* Stats Grid - Ajustado para melhor responsividade */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-6">
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
          title="A Receber"
          value={formatCurrency(stats.receivableRevenue)}
          icon={Clock}
          className="border-blue-200"
        />
        <StatsCard
          title="Valores Cancelados"
          value={formatCurrency(stats.cancelledRevenue)}
          icon={TrendingDown}
          className="border-red-200"
        />
        <StatsCard
          title="Taxa de Ocupação"
          value={`${stats.occupancyRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Chart and Upcoming Appointments */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenueData} selectedPeriod={selectedPeriod} />
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum agendamento próximo</p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{appointment.patient}</p>
                      <p className="text-xs text-gray-600 truncate">{appointment.professional}</p>
                      <p className="text-xs text-gray-500 truncate">{appointment.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-medium text-xs sm:text-sm">{appointment.time}</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethodsData.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma forma de pagamento registrada</p>
            ) : (
              paymentMethodsData.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate capitalize">{payment.method}</p>
                    <p className="text-xs text-gray-600">{payment.count} {payment.count === 1 ? 'pagamento' : 'pagamentos'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-medium text-xs sm:text-sm text-green-600">{formatCurrency(payment.total)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview - Ajustado para melhor responsividade */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Confirmados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.confirmedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Cancelados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.cancelledCount}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Faltaram</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{stats.noShowCount}</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Concluídos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{stats.completedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

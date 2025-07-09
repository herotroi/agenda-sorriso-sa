
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
  XCircle
} from 'lucide-react';

export default function Dashboard() {
  const upcomingAppointments = [
    { id: 1, patient: 'João Silva', time: '09:00', professional: 'Dr. Silva', type: 'Limpeza' },
    { id: 2, patient: 'Maria Santos', time: '10:30', professional: 'Dra. Costa', type: 'Canal' },
    { id: 3, patient: 'Pedro Lima', time: '14:00', professional: 'Dr. Silva', type: 'Consulta' },
    { id: 4, patient: 'Ana Oliveira', time: '15:30', professional: 'Dra. Costa', type: 'Extração' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da sua clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Agendamentos Hoje"
          value={12}
          icon={Calendar}
          change={{ value: 15, type: 'increase' }}
        />
        <StatsCard
          title="Pacientes Ativos"
          value={248}
          icon={Users}
          change={{ value: 8, type: 'increase' }}
        />
        <StatsCard
          title="Receita Mensal"
          value="R$ 28.500"
          icon={DollarSign}
          change={{ value: 12, type: 'increase' }}
        />
        <StatsCard
          title="Taxa de Ocupação"
          value="87%"
          icon={TrendingUp}
          change={{ value: 3, type: 'increase' }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue Chart */}
        <div className="md:col-span-2">
          <RevenueChart />
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
              {upcomingAppointments.map((appointment) => (
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
              ))}
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
                <p className="text-2xl font-bold text-green-600">28</p>
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
                <p className="text-2xl font-bold text-red-600">3</p>
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
                <p className="text-2xl font-bold text-orange-600">2</p>
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
                <p className="text-2xl font-bold text-blue-600">156</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

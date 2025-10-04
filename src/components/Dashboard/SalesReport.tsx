import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileCheck,
  Users,
  List
} from 'lucide-react';

interface SalesReportProps {
  stats: {
    todayAppointments: number;
    monthlyRevenue: number;
    receivableRevenue: number;
    cancelledRevenue: number;
    confirmedCount: number;
    cancelledCount: number;
    noShowCount: number;
    completedCount: number;
  };
  paymentMethodsData: Array<{
    method: string;
    count: number;
    total: number;
  }>;
  paymentStatusData: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  professionalAppointmentsData: Array<{
    professionalId: string;
    professionalName: string;
    appointmentCount: number;
  }>;
  appointmentDetails: Array<{
    id: string;
    patient_name: string;
    professional_name: string;
    start_time: string;
    price: number | null;
    payment_method: string | null;
    payment_status: string | null;
    status_name: string;
    is_blocked: boolean;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function SalesReport({ stats, paymentMethodsData, paymentStatusData, professionalAppointmentsData, appointmentDetails, dateRange }: SalesReportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = {
      'debito': 'Débito',
      'credito': 'Crédito',
      'credito_parcelado': 'Crédito Parcelado',
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'boleto': 'Boleto',
      'transferencia': 'Transferência',
      'nao_informado': 'Não Informado',
      'gratis': 'Grátis',
      'outros': 'Outros',
    };
    return methods[method || ''] || 'Não informado';
  };

  const getPaymentStatusLabel = (status: string | null) => {
    const statuses: Record<string, string> = {
      'pagamento_realizado': 'Pagamento Realizado',
      'aguardando_pagamento': 'Aguardando Pagamento',
      'nao_pagou': 'Não Pagou',
      'pagamento_cancelado': 'Pagamento Cancelado',
      'sem_pagamento': 'Sem Pagamento',
    };
    return statuses[status || ''] || 'Não informado';
  };

  return (
    <div className="space-y-6 p-8 bg-white">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Relatório de Vendas e Serviços</h1>
        <p className="text-gray-600 mt-2">
          Período: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Gerado em: {formatDate(new Date())} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Receita do Período</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Pagamento Realizado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">A Receber</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(stats.receivableRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Aguardando Pagamento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Valores Cancelados</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.cancelledRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Cancelados/Sem Pagamento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Formas de Pagamento
        </h2>
        <Card>
          <CardContent className="pt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Forma de Pagamento</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">Quantidade</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">% do Total</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodsData.map((payment, index) => {
                  const totalCount = paymentMethodsData.reduce((sum, p) => sum + p.count, 0);
                  const percentage = totalCount > 0 ? ((payment.count / totalCount) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 capitalize">{payment.method}</td>
                      <td className="py-3 px-4 text-center">{payment.count}</td>
                      <td className="py-3 px-4 text-center text-blue-600">{percentage}%</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(payment.total)}
                      </td>
                    </tr>
                  );
                })}
                {paymentMethodsData.length > 0 && (
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-center">
                      {paymentMethodsData.reduce((sum, p) => sum + p.count, 0)}
                    </td>
                    <td className="py-3 px-4 text-center">100%</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {formatCurrency(paymentMethodsData.reduce((sum, p) => sum + p.total, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Status de Pagamento */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileCheck className="h-5 w-5 mr-2" />
          Status de Pagamento
        </h2>
        <Card>
          <CardContent className="pt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">Quantidade</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">% do Total</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatusData.map((status, index) => {
                  const totalCount = paymentStatusData.reduce((sum, s) => sum + s.count, 0);
                  const percentage = totalCount > 0 ? ((status.count / totalCount) * 100).toFixed(1) : '0.0';
                  
                  // Define colors based on status
                  let statusColor = 'text-gray-600';
                  if (status.status.includes('Realizado')) statusColor = 'text-green-600';
                  if (status.status.includes('Aguardando')) statusColor = 'text-blue-600';
                  if (status.status.includes('Não Pagou')) statusColor = 'text-red-600';
                  if (status.status.includes('Cancelado') || status.status.includes('Sem Pagamento')) statusColor = 'text-orange-600';
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className={`py-3 px-4 font-medium ${statusColor}`}>{status.status}</td>
                      <td className="py-3 px-4 text-center">{status.count}</td>
                      <td className="py-3 px-4 text-center text-blue-600">{percentage}%</td>
                      <td className={`py-3 px-4 text-right font-semibold ${statusColor}`}>
                        {formatCurrency(status.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos por Profissional */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Agendamentos por Profissional
        </h2>
        <Card>
          <CardContent className="pt-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">Profissional</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">Nº de Agendamentos</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {professionalAppointmentsData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      Nenhum profissional cadastrado
                    </td>
                  </tr>
                ) : (
                  professionalAppointmentsData.map((prof, index) => {
                    const totalAppointments = professionalAppointmentsData.reduce((sum, p) => sum + p.appointmentCount, 0);
                    const percentage = totalAppointments > 0 ? ((prof.appointmentCount / totalAppointments) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{prof.professionalName}</td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600">{prof.appointmentCount}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{percentage}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Status de Agendamentos */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Status de Agendamentos
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmados</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.confirmedCount}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completedCount}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelados</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelledCount}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600" />
      </div>

      {/* Lista de Agendamentos */}
      <div className="break-before-page">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <List className="h-5 w-5 mr-2" />
          Lista de Agendamentos do Período
        </h2>
        <Card>
          <CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Data/Hora</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Paciente</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Profissional</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Valor</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Forma Pgto</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Status Pgto</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointmentDetails.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      Nenhum agendamento encontrado no período
                    </td>
                  </tr>
                ) : (
                  appointmentDetails.map((apt, index) => (
                    <tr key={index} className={`border-b hover:bg-gray-50 ${apt.is_blocked ? 'bg-yellow-50' : ''}`}>
                      <td className="py-2 px-2 text-xs">{formatDateTime(apt.start_time)}</td>
                      <td className="py-2 px-2 text-xs">{apt.patient_name}</td>
                      <td className="py-2 px-2 text-xs">{apt.professional_name}</td>
                      <td className="py-2 px-2 text-xs text-right">
                        {apt.price ? formatCurrency(apt.price) : '-'}
                      </td>
                      <td className="py-2 px-2 text-xs">{getPaymentMethodLabel(apt.payment_method)}</td>
                      <td className="py-2 px-2 text-xs">{getPaymentStatusLabel(apt.payment_status)}</td>
                      <td className="py-2 px-2 text-xs">
                        {apt.is_blocked ? 'Bloqueado' : apt.status_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Não Compareceram</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.noShowCount}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totais */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.confirmedCount + stats.completedCount + stats.cancelledCount + stats.noShowCount}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t pt-4 text-center text-sm text-gray-500">
        <p>Este relatório é confidencial e destinado apenas para uso interno.</p>
      </div>
    </div>
  );
}

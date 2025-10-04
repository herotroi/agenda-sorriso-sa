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
    <div className="space-y-6 p-8 bg-white print:p-0 print:space-y-2 print:max-w-[190mm] print:mx-auto" data-print-report>
      {/* Header */}
      <div className="text-center border-b pb-4 print:pb-1 print:mb-1">
        <h1 className="text-3xl font-bold text-gray-900 print:text-base">Relatório de Vendas e Serviços</h1>
        <p className="text-gray-600 mt-2 print:text-[9px] print:mt-0">
          Período: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </p>
        <p className="text-sm text-gray-500 mt-1 print:text-[8px] print:mt-0">
          Gerado em: {formatDate(new Date())} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="print:mt-1">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-xs print:mb-1">
          <DollarSign className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Resumo Financeiro
        </h2>
        <div className="grid grid-cols-3 gap-4 print:gap-1">
          <Card>
            <CardContent className="pt-6 print:pt-1 print:pb-1">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 print:text-[8px]">Receita do Período</p>
                <p className="text-2xl font-bold text-green-600 mt-2 print:text-xs print:mt-0">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1 print:text-[7px] print:mt-0">Pagamento Realizado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 print:pt-1 print:pb-1">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 print:text-[8px]">A Receber</p>
                <p className="text-2xl font-bold text-blue-600 mt-2 print:text-xs print:mt-0">{formatCurrency(stats.receivableRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1 print:text-[7px] print:mt-0">Aguardando Pagamento</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 print:pt-1 print:pb-1">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 print:text-[8px]">Valores Cancelados</p>
                <p className="text-2xl font-bold text-red-600 mt-2 print:text-xs print:mt-0">{formatCurrency(stats.cancelledRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1 print:text-[7px] print:mt-0">Cancelados/Sem Pagamento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="print:mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-sm print:mb-2">
          <CreditCard className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Formas de Pagamento
        </h2>
        <Card>
          <CardContent className="pt-6 print:pt-2 print:pb-2">
            <table className="w-full print:text-[9px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Forma de Pagamento</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Quantidade</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">% do Total</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethodsData.map((payment, index) => {
                  const totalCount = paymentMethodsData.reduce((sum, p) => sum + p.count, 0);
                  const percentage = totalCount > 0 ? ((payment.count / totalCount) * 100).toFixed(1) : '0.0';
                  
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 capitalize print:py-1 print:px-2">{payment.method}</td>
                        <td className="py-3 px-4 text-center print:py-1 print:px-2">{payment.count}</td>
                        <td className="py-3 px-4 text-center text-blue-600 print:py-1 print:px-2">{percentage}%</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600 print:py-1 print:px-2">
                          {formatCurrency(payment.total)}
                        </td>
                      </tr>
                    );
                })}
                {paymentMethodsData.length > 0 && (
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4 print:py-1 print:px-2">Total</td>
                    <td className="py-3 px-4 text-center print:py-1 print:px-2">
                      {paymentMethodsData.reduce((sum, p) => sum + p.count, 0)}
                    </td>
                    <td className="py-3 px-4 text-center print:py-1 print:px-2">100%</td>
                    <td className="py-3 px-4 text-right text-green-600 print:py-1 print:px-2">
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
      <div className="print:mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-sm print:mb-2">
          <FileCheck className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Status de Pagamento
        </h2>
        <Card>
          <CardContent className="pt-6 print:pt-2 print:pb-2">
            <table className="w-full print:text-[9px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Status</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Quantidade</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">% do Total</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Valor Total</th>
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
                        <td className={`py-3 px-4 font-medium ${statusColor} print:py-1 print:px-2`}>{status.status}</td>
                        <td className="py-3 px-4 text-center print:py-1 print:px-2">{status.count}</td>
                        <td className="py-3 px-4 text-center text-blue-600 print:py-1 print:px-2">{percentage}%</td>
                        <td className={`py-3 px-4 text-right font-semibold ${statusColor} print:py-1 print:px-2`}>
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
      <div className="print:mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-sm print:mb-2">
          <Users className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Agendamentos por Profissional
        </h2>
        <Card>
          <CardContent className="pt-6 print:pt-2 print:pb-2">
            <table className="w-full print:text-[9px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Profissional</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">Nº de Agendamentos</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700 print:py-1 print:px-2">% do Total</th>
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
                        <td className="py-3 px-4 print:py-1 print:px-2">{prof.professionalName}</td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600 print:py-1 print:px-2">{prof.appointmentCount}</td>
                        <td className="py-3 px-4 text-center text-gray-600 print:py-1 print:px-2">{percentage}%</td>
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
      <div className="print:mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-sm print:mb-2">
          <Calendar className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Status de Agendamentos
        </h2>
        <div className="grid grid-cols-2 gap-4 print:gap-2">
          <Card>
            <CardContent className="pt-6 print:pt-2 print:pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 print:text-[10px]">Confirmados</p>
                  <p className="text-3xl font-bold text-green-600 mt-2 print:text-base print:mt-1">{stats.confirmedCount}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600 print:h-6 print:w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 print:pt-2 print:pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 print:text-[10px]">Concluídos</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2 print:text-base print:mt-1">{stats.completedCount}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-blue-600 print:h-6 print:w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 print:pt-2 print:pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 print:text-[10px]">Cancelados</p>
                  <p className="text-3xl font-bold text-red-600 mt-2 print:text-base print:mt-1">{stats.cancelledCount}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600 print:h-6 print:w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 print:pt-2 print:pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 print:text-[10px]">Não Compareceram</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2 print:text-base print:mt-1">{stats.noShowCount}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600 print:h-6 print:w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totais */}
        <Card className="mt-4 print:mt-2">
          <CardContent className="pt-6 print:pt-2 print:pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 print:text-[10px]">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 print:text-base print:mt-1">
                  {stats.confirmedCount + stats.completedCount + stats.cancelledCount + stats.noShowCount}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-gray-600 print:h-6 print:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <div className="break-before-page print:mt-2">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center print:text-sm print:mb-2">
          <List className="h-5 w-5 mr-2 print:h-3 print:w-3 print:mr-1" />
          Lista de Agendamentos do Período
        </h2>
        <Card>
          <CardContent className="pt-6 print:pt-2 print:pb-2">
            <table className="w-full text-sm print:text-[8px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Data/Hora</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Paciente</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Profissional</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Valor</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Forma Pgto</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Status Pgto</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 print:py-1 print:px-1">Status</th>
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
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">{formatDateTime(apt.start_time)}</td>
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">{apt.patient_name}</td>
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">{apt.professional_name}</td>
                      <td className="py-2 px-2 text-xs text-right print:py-1 print:px-1 print:text-[8px]">
                        {apt.price ? formatCurrency(apt.price) : '-'}
                      </td>
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">{getPaymentMethodLabel(apt.payment_method)}</td>
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">{getPaymentStatusLabel(apt.payment_status)}</td>
                      <td className="py-2 px-2 text-xs print:py-1 print:px-1 print:text-[8px]">
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

      {/* Footer */}
      <div className="border-t pt-4 text-center text-sm text-gray-500 print:pt-2 print:text-[9px]">
        <p>Este relatório é confidencial e destinado apenas para uso interno.</p>
      </div>
    </div>
  );
}

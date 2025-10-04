
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { SalesReport } from '@/components/Dashboard/SalesReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  CreditCard,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { DateRangeSelector } from '@/components/Dashboard/DateRangeSelector';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateReportHTML } from '@/utils/reportPrintUtils';


export default function Dashboard() {
  const [showReport, setShowReport] = useState(false);
  const { 
    stats, 
    upcomingAppointments, 
    monthlyRevenueData,
    paymentMethodsData,
    paymentStatusData,
    professionalAppointmentsData,
    appointmentDetails, 
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

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Não foi possível abrir janela de impressão');
      return;
    }

    const dateRangeText = `${format(currentDateRange.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(currentDateRange.end, "dd/MM/yyyy", { locale: ptBR })}`;
    
    // Mapear os dados para o formato esperado pela função de geração HTML
    const reportStats = {
      revenue: stats.monthlyRevenue,
      receivable: stats.receivableRevenue,
      cancelled: stats.cancelledRevenue,
      confirmed: stats.confirmedCount,
      completed: stats.completedCount,
      cancelledCount: stats.cancelledCount,
      noShows: stats.noShowCount
    };

    const reportPaymentMethods = paymentMethodsData.map(pm => ({
      payment_method: pm.method,
      count: pm.count,
      total: pm.total
    }));

    const reportPaymentStatus = paymentStatusData.map(ps => ({
      payment_status: ps.status,
      count: ps.count,
      total: ps.total
    }));

    const reportProfessionalAppointments = professionalAppointmentsData.map(pa => ({
      professional_name: pa.professionalName,
      count: pa.appointmentCount
    }));

    const reportAppointmentDetails = appointmentDetails.map(ad => ({
      datetime: ad.start_time,
      patient_name: ad.patient_name,
      professional_name: ad.professional_name,
      status_name: ad.status_name,
      price: ad.price,
      payment_method: ad.payment_method,
      payment_status: ad.payment_status
    }));
    
    // Gerar HTML do relatório
    const reportHTML = generateReportHTML(
      reportStats,
      reportPaymentMethods,
      reportPaymentStatus,
      reportProfessionalAppointments,
      reportAppointmentDetails,
      dateRangeText
    );

    const printHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Vendas e Serviços - ${dateRangeText}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.4;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            background: white;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
          }
          
          .print-header h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .print-header .date-info {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0;
          }
          
          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: #f9fafb;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          table th,
          table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          
          table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          
          table tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }

          @media print {
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Relatório de Vendas e Serviços</h1>
          <div class="date-info">Período: ${dateRangeText}</div>
          <div class="date-info">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
        </div>
        
        ${reportHTML}
        
        <div class="footer">
          <p>Documento confidencial - Relatório gerado automaticamente pelo sistema</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={refetch} variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowReport(true)} variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Dialog do Relatório */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-full">
          <DialogHeader className="print:hidden">
            <DialogTitle>Relatório de Vendas e Serviços</DialogTitle>
          </DialogHeader>
          <div className="print:p-0">
            <SalesReport 
              stats={stats}
              paymentMethodsData={paymentMethodsData}
              paymentStatusData={paymentStatusData}
              professionalAppointmentsData={professionalAppointmentsData}
              appointmentDetails={appointmentDetails}
              dateRange={currentDateRange}
            />
            <div className="flex justify-end gap-2 mt-4 print:hidden">
              <Button onClick={() => setShowReport(false)} variant="outline">
                Fechar
              </Button>
              <Button onClick={handlePrintReport}>
                <FileText className="h-4 w-4 mr-2" />
                Imprimir Relatório
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

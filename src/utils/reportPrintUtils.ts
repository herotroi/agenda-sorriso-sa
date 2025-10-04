interface DashboardStats {
  revenue: number;
  receivable: number;
  cancelled: number;
  confirmed?: number;
  completed?: number;
  cancelledCount?: number;
  noShows?: number;
}

interface PaymentMethodData {
  payment_method: string | null;
  count: number;
  total: number;
}

interface PaymentStatusData {
  payment_status: string | null;
  count: number;
  total: number;
}

interface ProfessionalAppointmentData {
  professional_name: string;
  count: number;
}

interface AppointmentDetail {
  datetime: string;
  patient_name: string;
  professional_name: string;
  status_name: string;
  price: number | null;
  payment_method: string | null;
  payment_status: string | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPaymentMethodLabel = (method: string | null) => {
  const labels: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'credito': 'Cartão de Crédito',
    'debito': 'Cartão de Débito',
    'pix': 'PIX',
    'transferencia': 'Transferência',
    'cheque': 'Cheque'
  };
  return method ? labels[method] || method : 'Não informado';
};

const getPaymentStatusLabel = (status: string | null) => {
  const labels: Record<string, string> = {
    'pago': 'Pago',
    'pendente': 'Pendente',
    'cancelado': 'Cancelado',
    'nao_pagou': 'Não Pagou',
    'pagamento_realizado': 'Pagamento Realizado'
  };
  return status ? labels[status] || status : 'Não informado';
};

export function generateReportHTML(
  stats: DashboardStats,
  paymentMethods: PaymentMethodData[],
  paymentStatus: PaymentStatusData[],
  professionalAppointments: ProfessionalAppointmentData[],
  appointmentDetails: AppointmentDetail[],
  dateRange: string
): string {
  return `
    <!-- Resumo Financeiro -->
    <div class="section">
      <h2 class="section-title">Resumo Financeiro</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Faturamento Total</div>
          <div class="stat-value">${formatCurrency(stats.revenue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">A Receber</div>
          <div class="stat-value">${formatCurrency(stats.receivable)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cancelado</div>
          <div class="stat-value">${formatCurrency(stats.cancelled)}</div>
        </div>
      </div>
    </div>

    <!-- Métodos de Pagamento -->
    <div class="section">
      <h2 class="section-title">Métodos de Pagamento</h2>
      <table>
        <thead>
          <tr>
            <th>Método</th>
            <th style="text-align: right;">Quantidade</th>
            <th style="text-align: right;">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${paymentMethods.map(method => `
            <tr>
              <td>${getPaymentMethodLabel(method.payment_method)}</td>
              <td style="text-align: right;">${method.count}</td>
              <td style="text-align: right;">${formatCurrency(method.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Status de Pagamento -->
    <div class="section">
      <h2 class="section-title">Status de Pagamento</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th style="text-align: right;">Quantidade</th>
            <th style="text-align: right;">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${paymentStatus.map(status => `
            <tr>
              <td>${getPaymentStatusLabel(status.payment_status)}</td>
              <td style="text-align: right;">${status.count}</td>
              <td style="text-align: right;">${formatCurrency(status.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Atendimentos por Profissional -->
    <div class="section">
      <h2 class="section-title">Atendimentos por Profissional</h2>
      <table>
        <thead>
          <tr>
            <th>Profissional</th>
            <th style="text-align: right;">Atendimentos</th>
          </tr>
        </thead>
        <tbody>
          ${professionalAppointments.map(prof => `
            <tr>
              <td>${prof.professional_name}</td>
              <td style="text-align: right;">${prof.count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Resumo de Status -->
    <div class="section">
      <h2 class="section-title">Resumo de Status dos Agendamentos</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Confirmados</div>
          <div class="stat-value">${stats.confirmed || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Concluídos</div>
          <div class="stat-value">${stats.completed || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cancelados</div>
          <div class="stat-value">${stats.cancelledCount || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Não Compareceram</div>
          <div class="stat-value">${stats.noShows || 0}</div>
        </div>
      </div>
    </div>

    <!-- Lista Detalhada de Agendamentos -->
    <div class="section" style="page-break-before: always;">
      <h2 class="section-title">Lista Detalhada de Agendamentos</h2>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Paciente</th>
            <th>Profissional</th>
            <th style="text-align: right;">Valor</th>
            <th>Forma Pgto</th>
            <th>Status Pgto</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${appointmentDetails.map(apt => `
            <tr>
              <td>${formatDateTime(apt.datetime)}</td>
              <td>${apt.patient_name}</td>
              <td>${apt.professional_name}</td>
              <td style="text-align: right;">${apt.price ? formatCurrency(apt.price) : '-'}</td>
              <td>${getPaymentMethodLabel(apt.payment_method)}</td>
              <td>${getPaymentStatusLabel(apt.payment_status)}</td>
              <td>${apt.status_name}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

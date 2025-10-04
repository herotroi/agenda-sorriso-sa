
import { Clock, User, CreditCard, DollarSign } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentInfoProps {
  appointment: Appointment;
}

export function AppointmentInfo({ appointment }: AppointmentInfoProps) {
  console.log('AppointmentInfo - appointment data:', appointment);
  
  return (
    <div className="space-y-3">
      <div>
        <span className="font-medium">Profissional:</span>
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-4 w-4" />
          <span>{appointment.professionals?.name || 'Não especificado'}</span>
        </div>
      </div>

      <div>
        <span className="font-medium">Procedimento:</span>
        <p className="text-gray-600">{appointment.procedures?.name || 'Não especificado'}</p>
      </div>

      <div>
        <span className="font-medium">Data e Horário:</span>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(appointment.start_time).toLocaleDateString('pt-BR')} às{' '}
            {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} -{' '}
            {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      {appointment.payment_method && (
        <div>
          <span className="font-medium">Forma de Pagamento:</span>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span>{getPaymentMethodLabel(appointment.payment_method)}</span>
          </div>
        </div>
      )}

      {appointment.payment_status && (
        <div>
          <span className="font-medium">Status de Pagamento:</span>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{getPaymentStatusLabel(appointment.payment_status)}</span>
          </div>
        </div>
      )}

      {appointment.notes && (
        <div>
          <span className="font-medium">Observações:</span>
          <p className="text-gray-600">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}

function getPaymentMethodLabel(value: string): string {
  const methods: Record<string, string> = {
    'debito': 'Débito',
    'credito': 'Crédito',
    'credito_parcelado': 'Crédito Parcelado',
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'boleto': 'Boleto',
    'nao_informado': 'Não Informado',
    'gratis': 'Grátis',
    'outros': 'Outros'
  };
  return methods[value] || value;
}

function getPaymentStatusLabel(value: string): string {
  const statuses: Record<string, string> = {
    'pagamento_realizado': 'Pagamento Realizado',
    'aguardando_pagamento': 'Aguardando Pagamento',
    'nao_pagou': 'Não Pagou',
    'pagamento_cancelado': 'Pagamento Cancelado',
    'sem_pagamento': 'Sem Pagamento'
  };
  return statuses[value] || value;
}

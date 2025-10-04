import { FormField } from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentSectionProps {
  paymentMethod: string;
  paymentStatus: string;
  onPaymentMethodChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  currentPaymentMethod?: string | undefined;
  currentPaymentStatus?: string | undefined;
}

const paymentMethods = [
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'credito_parcelado', label: 'Crédito Parcelado' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'nao_informado', label: 'Não Informado' },
  { value: 'gratis', label: 'Grátis' },
  { value: 'outros', label: 'Outros' }
];

const paymentStatuses = [
  { value: 'pagamento_realizado', label: 'Pagamento Realizado' },
  { value: 'aguardando_pagamento', label: 'Aguardando Pagamento' },
  { value: 'nao_pagou', label: 'Não Pagou' },
  { value: 'pagamento_cancelado', label: 'Pagamento Cancelado' },
  { value: 'sem_pagamento', label: 'Sem Pagamento' }
];

export function PaymentSection({
  paymentMethod,
  paymentStatus,
  onPaymentMethodChange,
  onPaymentStatusChange,
  currentPaymentMethod,
  currentPaymentStatus
}: PaymentSectionProps) {
  const hasMethodOption = paymentMethod && paymentMethods.some(m => m.value === paymentMethod);
  const hasStatusOption = paymentStatus && paymentStatuses.some(s => s.value === paymentStatus);

  const fallbackMethodLabel = currentPaymentMethod || paymentMethod;
  const fallbackStatusLabel = currentPaymentStatus || paymentStatus;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Informações de Pagamento</h3>
      
      <FormField
        label="Forma de Pagamento"
        currentValue={currentPaymentMethod}
      >
        <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {!hasMethodOption && !!paymentMethod && (
              <SelectItem value={paymentMethod}>
                {fallbackMethodLabel}
              </SelectItem>
            )}
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        label="Status de Pagamento"
        currentValue={currentPaymentStatus}
      >
        <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {!hasStatusOption && !!paymentStatus && (
              <SelectItem value={paymentStatus}>
                {fallbackStatusLabel}
              </SelectItem>
            )}
            {paymentStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
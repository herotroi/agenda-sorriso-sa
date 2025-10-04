
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  payment_method?: string | null;
  payment_status?: string | null;
}

interface AppointmentPaymentUpdaterProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate?: () => void;
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

export function AppointmentPaymentUpdater({ appointment, onClose, onUpdate }: AppointmentPaymentUpdaterProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(appointment.payment_method || '');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(appointment.payment_status || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handlePaymentUpdate = async () => {
    if (selectedPaymentMethod === (appointment.payment_method || '') && 
        selectedPaymentStatus === (appointment.payment_status || '')) {
      toast({
        title: 'Informação',
        description: 'Nenhuma alteração foi feita',
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          payment_method: selectedPaymentMethod || null,
          payment_status: selectedPaymentStatus || null
        })
        .eq('id', appointment.id)
        .select('*');

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Atualização de pagamento bem-sucedida:', data);

      toast({
        title: 'Sucesso',
        description: 'Informações de pagamento atualizadas com sucesso',
      });

      if (onUpdate) {
        onUpdate();
      }
      onClose();

    } catch (error: any) {
      console.error('Erro ao atualizar pagamento:', error);
      
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar informações de pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentMethodLabel = paymentMethods.find(m => m.value === appointment.payment_method)?.label || 'Não definido';
  const currentStatusLabel = paymentStatuses.find(s => s.value === appointment.payment_status)?.label || 'Não definido';

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="payment-method" className="text-sm font-medium">Forma de Pagamento</Label>
        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 mt-1">
          Atual: {currentMethodLabel}
        </div>
      </div>

      <div>
        <Label htmlFor="payment-status" className="text-sm font-medium">Status de Pagamento</Label>
        <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500 mt-1">
          Atual: {currentStatusLabel}
        </div>
      </div>
      
      <Button
        onClick={handlePaymentUpdate}
        disabled={isUpdating}
        className="w-full"
        variant="default"
      >
        {isUpdating ? 'Salvando...' : 'Salvar Pagamento'}
      </Button>
    </div>
  );
}


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  status: string;
}

interface AppointmentStatusUpdaterProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentStatusUpdater({ appointment, onClose }: AppointmentStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState(appointment.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    'Confirmado',
    'Cancelado',
    'Não Compareceu',
    'Em atendimento',
    'Finalizado'
  ];

  const handleStatusUpdate = async () => {
    if (selectedStatus === appointment.status) {
      toast({
        title: 'Informação',
        description: 'O status selecionado é o mesmo atual',
      });
      return;
    }

    console.log('Tentando atualizar status:', {
      appointmentId: appointment.id,
      statusAtual: appointment.status,
      novoStatus: selectedStatus,
      statusValidos: statusOptions
    });

    try {
      setIsUpdatingStatus(true);
      
      // Primeiro, vamos verificar se o appointment existe
      const { data: existingAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointment.id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar agendamento:', fetchError);
        throw fetchError;
      }

      console.log('Agendamento encontrado:', existingAppointment);

      // Agora vamos tentar a atualização
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: selectedStatus
        })
        .eq('id', appointment.id)
        .select('*');

      if (error) {
        console.error('Erro detalhado na atualização:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Status atualizado com sucesso:', data);

      toast({
        title: 'Sucesso',
        description: 'Status do agendamento atualizado com sucesso',
      });

      // Fechar o modal após sucesso
      onClose();
      
      // Forçar recarregamento da página para mostrar as mudanças
      window.location.reload();

    } catch (error: any) {
      console.error('Erro completo ao atualizar status:', error);
      
      let errorMessage = 'Erro desconhecido ao atualizar status';
      
      if (error.code === '23514') {
        errorMessage = 'Status inválido. Verifique se o valor está correto.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="status" className="text-sm font-medium">Alterar Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        onClick={handleStatusUpdate}
        disabled={isUpdatingStatus || selectedStatus === appointment.status}
        className="w-full"
        variant="default"
      >
        {isUpdatingStatus ? 'Salvando...' : 'Salvar Status'}
      </Button>
    </div>
  );
}


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

    console.log('Dados da atualização:', {
      appointmentId: appointment.id,
      statusAtual: appointment.status,
      novoStatus: selectedStatus,
      statusDisponivel: statusOptions.includes(selectedStatus)
    });

    try {
      setIsUpdatingStatus(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: selectedStatus })
        .eq('id', appointment.id)
        .select('*');

      if (error) {
        console.error('Erro do Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Atualização bem-sucedida:', data);

      toast({
        title: 'Sucesso',
        description: 'Status do agendamento atualizado com sucesso',
      });

      // Fechar o modal após sucesso
      onClose();
      
      // Forçar recarregamento da página para mostrar as mudanças
      window.location.reload();

    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      let errorMessage = 'Erro ao atualizar status do agendamento';
      let errorTitle = 'Erro';
      
      if (error.code === '23514') {
        errorMessage = `Status "${selectedStatus}" não é válido. Valores aceitos: ${statusOptions.join(', ')}`;
        errorTitle = 'Status Inválido';
      } else if (error.code === '42601') {
        errorMessage = 'Erro de sintaxe na consulta. Contacte o suporte.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
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
      
      <div className="text-xs text-gray-500">
        Status atual: {appointment.status}
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

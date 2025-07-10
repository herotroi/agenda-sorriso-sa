
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

    try {
      setIsUpdatingStatus(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: selectedStatus })
        .eq('id', appointment.id)
        .select('*');

      if (error) {
        throw error;
      }

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
      
      if (error.code === '23514') {
        errorMessage = 'Status inválido. Por favor, tente novamente.';
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

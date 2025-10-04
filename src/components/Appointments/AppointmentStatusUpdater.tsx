
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  status_id: number;
}

interface AppointmentStatusUpdaterProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate?: () => void;
}

interface StatusOption {
  id: number;
  key: string;
  label: string;
  color: string;
}

export function AppointmentStatusUpdater({ appointment, onClose, onUpdate }: AppointmentStatusUpdaterProps) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(appointment.status_id);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStatusOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_statuses')
        .select('*')
        .eq('active', true)
        .order('id');

      if (error) throw error;
      setStatusOptions(data || []);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar opções de status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  const handleStatusUpdate = async () => {
    if (selectedStatusId === appointment.status_id) {
      toast({
        title: 'Informação',
        description: 'O status selecionado é o mesmo atual',
      });
      return;
    }

    const selectedStatus = statusOptions.find(s => s.id === selectedStatusId);
    console.log('Atualizando status:', {
      appointmentId: appointment.id,
      statusAtualId: appointment.status_id,
      novoStatusId: selectedStatusId,
      novoStatusLabel: selectedStatus?.label
    });

    try {
      setIsUpdatingStatus(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status_id: selectedStatusId })
        .eq('id', appointment.id)
        .select('*');

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Atualização bem-sucedida:', data);

      toast({
        title: 'Sucesso',
        description: 'Status do agendamento atualizado com sucesso',
      });

      if (onUpdate) {
        onUpdate();
      }
      onClose();

    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do agendamento',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-center">Carregando opções de status...</div>;
  }

  const currentStatus = statusOptions.find(s => s.id === appointment.status_id);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="status" className="text-sm font-medium">Alterar Status</Label>
        <Select value={selectedStatusId.toString()} onValueChange={(value) => setSelectedStatusId(parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-xs text-gray-500">
        Status atual: {currentStatus?.label || 'Não definido'}
      </div>
      
      <Button
        onClick={handleStatusUpdate}
        disabled={isUpdatingStatus || selectedStatusId === appointment.status_id}
        className="w-full"
        variant="default"
      >
        {isUpdatingStatus ? 'Salvando...' : 'Salvar Status'}
      </Button>
    </div>
  );
}


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppointmentForm } from './AppointmentForm';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  patients: { full_name: string };
  procedures: { name: string } | null;
}

interface AppointmentDetailsProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetails({ appointment, isOpen, onClose }: AppointmentDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-500';
      case 'Cancelado': return 'bg-red-500';
      case 'Não Compareceu': return 'bg-gray-500';
      case 'Em atendimento': return 'bg-blue-500';
      case 'Finalizado': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

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

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso',
      });

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir agendamento',
        variant: 'destructive',
      });
    }
  };

  if (isEditing) {
    return (
      <AppointmentForm
        isOpen={isOpen}
        onClose={() => {
          setIsEditing(false);
          onClose();
        }}
        appointmentToEdit={appointment}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{appointment.patients?.full_name}</h3>
            <Badge className={`${getStatusColor(appointment.status)} text-white`}>
              {appointment.status}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
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

            {appointment.notes && (
              <div>
                <span className="font-medium">Observações:</span>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            )}
          </div>

          <Separator />

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

          <Separator />

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

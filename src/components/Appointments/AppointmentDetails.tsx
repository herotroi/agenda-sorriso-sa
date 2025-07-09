
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status do agendamento atualizado',
      });

      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status',
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
        description: 'Agendamento excluído',
      });

      onClose();
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
              <span className="font-medium text-sm">Atualizar Status:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={appointment.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdatingStatus || appointment.status === status}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
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

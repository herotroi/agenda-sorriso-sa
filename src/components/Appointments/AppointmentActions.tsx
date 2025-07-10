
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentActionsProps {
  appointmentId: string;
  onEdit: () => void;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AppointmentActions({ appointmentId, onEdit, onClose, onUpdate }: AppointmentActionsProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso',
      });

      if (onUpdate) {
        onUpdate();
      }
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

  return (
    <div className="flex justify-between gap-2">
      <Button
        variant="outline"
        onClick={onEdit}
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
  );
}

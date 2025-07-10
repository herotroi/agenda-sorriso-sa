
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentActionsProps {
  appointmentId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AppointmentActions({ appointmentId, onClose, onUpdate }: AppointmentActionsProps) {
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
    <div className="flex justify-center">
      <Button
        variant="destructive"
        onClick={handleDelete}
        className="w-full"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir Agendamento
      </Button>
    </div>
  );
}

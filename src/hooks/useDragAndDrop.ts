
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentValidation } from './useAppointmentValidation';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export const useDragAndDrop = () => {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { checkTimeConflict } = useAppointmentValidation();

  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setIsDragging(false);
  };

  const handleDrop = async (newStartTime: string, professionalId: string) => {
    if (!draggedAppointment) return;

    try {
      // Calculate duration
      const originalStart = new Date(draggedAppointment.start_time);
      const originalEnd = new Date(draggedAppointment.end_time);
      const duration = originalEnd.getTime() - originalStart.getTime();
      
      const newStart = new Date(newStartTime);
      const newEnd = new Date(newStart.getTime() + duration);

      // Check for conflicts
      const { hasConflict, message } = await checkTimeConflict(
        professionalId,
        newStart.toISOString(),
        newEnd.toISOString(),
        draggedAppointment.id
      );

      if (hasConflict) {
        toast({
          title: 'Conflito de Agendamento',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      // Update appointment
      const { error } = await supabase
        .from('appointments')
        .update({
          professional_id: professionalId,
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
        })
        .eq('id', draggedAppointment.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Agendamento movido com sucesso',
      });

      // Refresh the calendar
      window.location.reload();
    } catch (error) {
      console.error('Error moving appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao mover agendamento',
        variant: 'destructive',
      });
    }
  };

  return {
    draggedAppointment,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop
  };
};

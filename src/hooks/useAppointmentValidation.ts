
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export const useAppointmentValidation = () => {
  const checkTimeConflict = async (
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<{ hasConflict: boolean; message?: string }> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, patients(full_name)')
        .eq('professional_id', professionalId)
        .neq('status', 'Cancelado')
        .gte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T00:00:00')
        .lte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T23:59:59');

      if (error) throw error;

      const conflicts = data?.filter(appointment => {
        if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
          return false;
        }

        const existingStart = new Date(appointment.start_time);
        const existingEnd = new Date(appointment.end_time);
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        // Check for overlap
        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (conflicts && conflicts.length > 0) {
        const conflictTime = new Date(conflicts[0].start_time).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return {
          hasConflict: true,
          message: `Este horário já está ocupado para este profissional. Conflito às ${conflictTime}.`
        };
      }

      return { hasConflict: false };
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return { hasConflict: false };
    }
  };

  const validateTimeSlot = (startTime: string, endTime: string): { isValid: boolean; message?: string } => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
      return {
        isValid: false,
        message: 'O horário de início deve ser anterior ao horário de fim.'
      };
    }

    if (start < now) {
      return {
        isValid: false,
        message: 'Não é possível agendar para horários no passado.'
      };
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    if (duration < 15) {
      return {
        isValid: false,
        message: 'A duração mínima do agendamento é de 15 minutos.'
      };
    }

    return { isValid: true };
  };

  return {
    checkTimeConflict,
    validateTimeSlot
  };
};

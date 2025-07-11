
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfessionalWorkingHours } from './useProfessionalWorkingHours';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export const useAppointmentValidation = () => {
  const { toast } = useToast();
  const { validateWorkingHours, professionals } = useProfessionalWorkingHours();

  const checkBreakTimeConflict = (
    professionalId: string,
    startTime: string,
    endTime: string
  ): { hasConflict: boolean; message?: string } => {
    const professional = professionals.find(p => p.id === professionalId);
    
    if (!professional || !professional.break_times) {
      return { hasConflict: false };
    }

    const appointmentStart = new Date(startTime);
    const appointmentEnd = new Date(endTime);
    const appointmentDate = appointmentStart.toISOString().split('T')[0];

    // Verificar se o procedimento conflita com intervalos
    let breakTimes = [];
    try {
      breakTimes = typeof professional.break_times === 'string' 
        ? JSON.parse(professional.break_times) 
        : professional.break_times;
    } catch (e) {
      console.warn('Failed to parse break_times:', e);
      return { hasConflict: false };
    }

    if (Array.isArray(breakTimes)) {
      for (const breakTime of breakTimes) {
        if (breakTime && typeof breakTime === 'object' && breakTime.start && breakTime.end) {
          const breakStart = new Date(`${appointmentDate}T${breakTime.start}:00`);
          const breakEnd = new Date(`${appointmentDate}T${breakTime.end}:00`);

          // Verificar se há sobreposição
          if (appointmentStart < breakEnd && appointmentEnd > breakStart) {
            const duration = Math.round((appointmentEnd.getTime() - appointmentStart.getTime()) / (1000 * 60));
            const breakStartTime = breakTime.start;
            const breakEndTime = breakTime.end;
            
            return {
              hasConflict: true,
              message: `O procedimento de ${duration} minutos não pode ser realizado neste horário pois conflita com o intervalo das ${breakStartTime} às ${breakEndTime}. Por favor, altere a duração do procedimento ou escolha outro horário.`
            };
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const checkTimeConflict = async (
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<{ hasConflict: boolean; message?: string }> => {
    console.log('🔍 Checking time conflict:', { professionalId, startTime, endTime, excludeAppointmentId });
    
    try {
      // Primeiro, validar se o profissional está trabalhando
      const workingHoursValidation = validateWorkingHours(professionalId, startTime);
      
      if (!workingHoursValidation.isAvailable) {
        return {
          hasConflict: true,
          message: workingHoursValidation.message || 'Profissional não está disponível neste horário'
        };
      }

      // Verificar conflitos com intervalos/folgas
      const breakConflict = checkBreakTimeConflict(professionalId, startTime, endTime);
      if (breakConflict.hasConflict) {
        return breakConflict;
      }

      // Verificar se está em período de férias
      const professional = professionals.find(p => p.id === professionalId);
      if (professional?.vacation_active && professional.vacation_start && professional.vacation_end) {
        const appointmentDate = new Date(startTime);
        const vacationStart = new Date(professional.vacation_start);
        const vacationEnd = new Date(professional.vacation_end);
        
        if (appointmentDate >= vacationStart && appointmentDate <= vacationEnd) {
          return {
            hasConflict: true,
            message: 'Profissional está de férias neste período. Escolha outra data.'
          };
        }
      }

      // Verificar conflitos com outros agendamentos
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, patients(full_name)')
        .eq('professional_id', professionalId)
        .neq('status', 'Cancelado')
        .gte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T00:00:00')
        .lte('start_time', new Date(startTime).toISOString().split('T')[0] + 'T23:59:59');

      if (error) throw error;

      console.log('📋 Existing appointments for conflict check:', data);

      const conflicts = data?.filter(appointment => {
        if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
          return false;
        }

        const existingStart = new Date(appointment.start_time);
        const existingEnd = new Date(appointment.end_time);
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        // Check for overlap: newStart < existingEnd && newEnd > existingStart
        const hasOverlap = (newStart < existingEnd && newEnd > existingStart);
        
        if (hasOverlap) {
          console.log('⚠️ Conflict detected:', {
            existing: { start: existingStart, end: existingEnd },
            new: { start: newStart, end: newEnd }
          });
        }
        
        return hasOverlap;
      });

      if (conflicts && conflicts.length > 0) {
        const conflictTime = new Date(conflicts[0].start_time).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const message = `Este horário já está ocupado para este profissional. Conflito às ${conflictTime}.`;
        
        console.log('❌ Time conflict found:', message);
        
        return {
          hasConflict: true,
          message
        };
      }

      console.log('✅ No time conflicts found');
      return { hasConflict: false };
    } catch (error) {
      console.error('❌ Error checking time conflict:', error);
      return { hasConflict: false };
    }
  };

  const validateTimeSlot = (startTime: string, endTime: string): { isValid: boolean; message?: string } => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    console.log('🕐 Validating time slot:', { startTime, endTime });

    if (start >= end) {
      const message = 'O horário de início deve ser anterior ao horário de fim.';
      console.log('❌ Invalid time slot - start >= end:', message);
      return {
        isValid: false,
        message
      };
    }

    if (start < now) {
      const message = 'Não é possível agendar para horários no passado.';
      console.log('❌ Invalid time slot - past time:', message);
      return {
        isValid: false,
        message
      };
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    if (duration < 15) {
      const message = 'A duração mínima do agendamento é de 15 minutos.';
      console.log('❌ Invalid time slot - too short:', message);
      return {
        isValid: false,
        message
      };
    }

    console.log('✅ Time slot is valid');
    return { isValid: true };
  };

  const showConflictToast = (message: string) => {
    toast({
      title: 'Conflito de Horário',
      description: message,
      variant: 'destructive',
    });
  };

  const showValidationToast = (message: string) => {
    toast({
      title: 'Horário Inválido',
      description: message,
      variant: 'destructive',
    });
  };

  return {
    checkTimeConflict,
    validateTimeSlot,
    showConflictToast,
    showValidationToast
  };
};

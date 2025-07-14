
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface Professional {
  id: string;
  name: string;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  break_times?: Json;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: Json;
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
}

interface WorkingHoursValidation {
  isWorkingDay: boolean;
  isWithinShift: boolean;
  isOnBreak: boolean;
  isOnVacation: boolean;
  isAvailable: boolean;
  message?: string;
}

export function useProfessionalWorkingHours() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const validateWorkingHours = (
    professionalId: string,
    appointmentDateTime: string
  ): WorkingHoursValidation => {
    const professional = professionals.find(p => p.id === professionalId);
    
    if (!professional) {
      return {
        isWorkingDay: false,
        isWithinShift: false,
        isOnBreak: false,
        isOnVacation: false,
        isAvailable: false,
        message: 'Profissional não encontrado'
      };
    }

    const appointmentDate = new Date(appointmentDateTime);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const appointmentTime = appointmentDate.toTimeString().slice(0, 5); // HH:MM
    const appointmentDateOnly = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );

    // Verificar se está de férias com parsing correto
    if (professional.vacation_active && professional.vacation_start && professional.vacation_end) {
      const vacationStartParts = professional.vacation_start.split('-');
      const vacationEndParts = professional.vacation_end.split('-');
      
      const vacationStart = new Date(
        parseInt(vacationStartParts[0]), 
        parseInt(vacationStartParts[1]) - 1, 
        parseInt(vacationStartParts[2])
      );
      
      const vacationEnd = new Date(
        parseInt(vacationEndParts[0]), 
        parseInt(vacationEndParts[1]) - 1, 
        parseInt(vacationEndParts[2])
      );
      
      console.log('Vacation validation:', {
        professionalName: professional.name,
        appointmentDateOnly: appointmentDateOnly.toDateString(),
        vacationStart: vacationStart.toDateString(),
        vacationEnd: vacationEnd.toDateString(),
        isInVacation: appointmentDateOnly >= vacationStart && appointmentDateOnly <= vacationEnd
      });
      
      if (appointmentDateOnly >= vacationStart && appointmentDateOnly <= vacationEnd) {
        return {
          isWorkingDay: false,
          isWithinShift: false,
          isOnBreak: false,
          isOnVacation: true,
          isAvailable: false,
          message: 'Profissional está de férias neste período'
        };
      }
    }

    // Verificar dias de trabalho - parsing JSON safely
    let workingDays = [true, true, true, true, true, false, false]; // default
    if (professional.working_days) {
      try {
        const parsed = typeof professional.working_days === 'string' 
          ? JSON.parse(professional.working_days) 
          : professional.working_days;
        if (Array.isArray(parsed)) {
          workingDays = parsed;
        }
      } catch (e) {
        console.warn('Failed to parse working_days:', e);
      }
    }

    const isWorkingDay = workingDays[dayOfWeek];

    if (!isWorkingDay) {
      // Verificar se tem expediente de fim de semana
      if (professional.weekend_shift_active && (dayOfWeek === 0 || dayOfWeek === 6)) {
        const weekendStart = professional.weekend_shift_start;
        const weekendEnd = professional.weekend_shift_end;
        
        if (weekendStart && weekendEnd && appointmentTime >= weekendStart && appointmentTime <= weekendEnd) {
          return {
            isWorkingDay: true,
            isWithinShift: true,
            isOnBreak: false,
            isOnVacation: false,
            isAvailable: true
          };
        }
      }
      
      return {
        isWorkingDay: false,
        isWithinShift: false,
        isOnBreak: false,
        isOnVacation: false,
        isAvailable: false,
        message: 'Profissional não trabalha neste dia da semana'
      };
    }

    // Verificar se está dentro do horário de expediente
    let isWithinShift = false;
    
    // Primeiro turno
    if (professional.first_shift_start && professional.first_shift_end) {
      if (appointmentTime >= professional.first_shift_start && appointmentTime <= professional.first_shift_end) {
        isWithinShift = true;
      }
    }

    // Segundo turno
    if (!isWithinShift && professional.second_shift_start && professional.second_shift_end) {
      if (appointmentTime >= professional.second_shift_start && appointmentTime <= professional.second_shift_end) {
        isWithinShift = true;
      }
    }

    if (!isWithinShift) {
      return {
        isWorkingDay: true,
        isWithinShift: false,
        isOnBreak: false,
        isOnVacation: false,
        isAvailable: false,
        message: 'Horário fora do expediente do profissional'
      };
    }

    // Verificar se está em horário de pausa - parsing JSON safely
    if (professional.break_times) {
      try {
        const breakTimes = typeof professional.break_times === 'string' 
          ? JSON.parse(professional.break_times) 
          : professional.break_times;
        
        if (Array.isArray(breakTimes)) {
          for (const breakTime of breakTimes) {
            if (breakTime && typeof breakTime === 'object' && breakTime.start && breakTime.end) {
              if (appointmentTime >= breakTime.start && appointmentTime <= breakTime.end) {
                return {
                  isWorkingDay: true,
                  isWithinShift: true,
                  isOnBreak: true,
                  isOnVacation: false,
                  isAvailable: false,
                  message: 'Horário coincide com pausa do profissional'
                };
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse break_times:', e);
      }
    }

    return {
      isWorkingDay: true,
      isWithinShift: true,
      isOnBreak: false,
      isOnVacation: false,
      isAvailable: true
    };
  };

  return {
    validateWorkingHours,
    professionals
  };
}

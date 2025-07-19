
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';
import { isDateInVacationPeriod } from '@/utils/vacationDateUtils';

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

      // Transform the data to match the Professional interface
      const transformedProfessionals: Professional[] = (data || []).map(prof => ({
        id: prof.id,
        name: prof.name,
        specialty: prof.specialty || '',
        email: prof.email || '',
        phone: prof.phone || '',
        color: prof.color,
        calendarColor: prof.color,
        created_at: prof.created_at,
        updated_at: prof.updated_at,
        active: prof.active || false,
        user_id: prof.user_id,
        break_times: Array.isArray(prof.break_times) 
          ? prof.break_times 
          : (typeof prof.break_times === 'string' ? JSON.parse(prof.break_times || '[]') : []),
        working_days: Array.isArray(prof.working_days)
          ? prof.working_days
          : (typeof prof.working_days === 'string' ? JSON.parse(prof.working_days || '[true,true,true,true,true,false,false]') : [true,true,true,true,true,false,false]),
        vacation_active: prof.vacation_active || false,
        vacation_start: prof.vacation_start || '',
        vacation_end: prof.vacation_end || '',
        crm_cro: prof.crm_cro || '',
        first_shift_start: prof.first_shift_start || '',
        first_shift_end: prof.first_shift_end || '',
        second_shift_start: prof.second_shift_start || '',
        second_shift_end: prof.second_shift_end || '',
        weekend_shift_active: prof.weekend_shift_active || false,
        weekend_shift_start: prof.weekend_shift_start || '',
        weekend_shift_end: prof.weekend_shift_end || '',
        working_hours: prof.working_hours || {}
      }));

      setProfessionals(transformedProfessionals);
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

    // Verificar se está de férias usando utilitário centralizado com ajuste de datas
    if (professional.vacation_active && professional.vacation_start && professional.vacation_end) {
      // Ajustar as datas para começar e terminar um dia antes
      const startDate = new Date(professional.vacation_start);
      const endDate = new Date(professional.vacation_end);
      
      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      
      const adjustedStart = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const adjustedEnd = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      if (isDateInVacationPeriod(appointmentDateOnly, adjustedStart, adjustedEnd)) {
        return {
          isWorkingDay: false,
          isWithinShift: false,
          isOnBreak: false,
          isOnVacation: true,
          isAvailable: false,
          message: `${professional.name} está de férias de ${professional.vacation_start} a ${professional.vacation_end}.`
        };
      }
    }

    // Verificar dias de trabalho - usar array diretamente
    const workingDays = professional.working_days || [true, true, true, true, true, false, false];
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

    // Verificar se está em horário de pausa - usar array diretamente
    const breakTimes = professional.break_times || [];
    
    for (const breakTime of breakTimes) {
      if (breakTime && breakTime.start && breakTime.end) {
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

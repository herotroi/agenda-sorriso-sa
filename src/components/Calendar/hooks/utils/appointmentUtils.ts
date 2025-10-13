import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/utils/timezoneUtils';

export async function fetchAppointments(selectedDate: Date): Promise<Appointment[]> {
  console.log('🔄 Fetching appointments for date:', selectedDate);
  
  // Usar utilitários de timezone para obter início e fim do dia
  const startOfDay = getStartOfDay(selectedDate);
  const endOfDay = getEndOfDay(selectedDate);

  console.log('📅 Date range:', { 
    start: startOfDay.toISOString(), 
    end: endOfDay.toISOString(),
    selectedDate: selectedDate.toDateString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(full_name),
        professionals(name, color),
        procedures(name),
        appointment_statuses(label, color)
      `)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time');

    if (error) throw error;
    
    console.log('✅ Appointments fetched:', data?.length || 0);
    console.log('📋 Appointments data:', data);
    
    // Map database fields to frontend interface
    return (data || []).map(apt => ({
      ...apt,
      date: new Date(apt.start_time).toISOString().split('T')[0]
    })) as Appointment[];
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return [];
  }
}

export function checkTimeConflicts(
  appointments: Appointment[],
  startTime: Date,
  endTime: Date,
  professionalId: string,
  excludeAppointmentId?: string
): boolean {
  return appointments.some(appointment => {
    // Skip the appointment being edited
    if (excludeAppointmentId && appointment.id === excludeAppointmentId) {
      return false;
    }

    // Only check conflicts for the same professional
    if (appointment.professional_id !== professionalId) {
      return false;
    }

    const appointmentStart = new Date(appointment.start_time);
    const appointmentEnd = new Date(appointment.end_time);

    // Check for overlap
    return (
      (startTime >= appointmentStart && startTime < appointmentEnd) ||
      (endTime > appointmentStart && endTime <= appointmentEnd) ||
      (startTime <= appointmentStart && endTime >= appointmentEnd)
    );
  });
}

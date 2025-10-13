import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { getStartOfDay, getEndOfDay } from '@/utils/timezoneUtils';

export async function fetchAppointments(selectedDate: Date): Promise<Appointment[]> {
  console.log('🔄 Fetching appointments for date:', selectedDate);
  
  // Formatar data para timestamp sem timezone (YYYY-MM-DD)
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  
  const startOfDay = `${year}-${month}-${day} 00:00:00`;
  const endOfDay = `${year}-${month}-${day} 23:59:59`;

  console.log('📅 Date range:', { 
    start: startOfDay, 
    end: endOfDay,
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
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
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

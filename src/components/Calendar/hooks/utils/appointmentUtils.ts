
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

export async function fetchAppointments(selectedDate: Date): Promise<Appointment[]> {
  console.log('🔄 Fetching appointments for date:', selectedDate);
  
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log('📅 Date range:', { 
    start: startOfDay.toISOString(), 
    end: endOfDay.toISOString(),
    selectedDate: selectedDate.toDateString()
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
      startTime: apt.start_time,
      endTime: apt.end_time,
      patientId: apt.patient_id,
      professionalId: apt.professional_id,
      procedureId: apt.procedure_id,
      date: new Date(apt.start_time).toISOString().split('T')[0],
      createdAt: apt.created_at,
      status: apt.status || 'confirmado',
      isBlocked: apt.is_blocked || false
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
    if (appointment.professionalId !== professionalId) {
      return false;
    }

    const appointmentStart = new Date(appointment.startTime);
    const appointmentEnd = new Date(appointment.endTime);

    // Check for overlap
    return (
      (startTime >= appointmentStart && startTime < appointmentEnd) ||
      (endTime > appointmentStart && endTime <= appointmentEnd) ||
      (startTime <= appointmentStart && endTime >= appointmentEnd)
    );
  });
}

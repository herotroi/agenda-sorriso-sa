
import { supabase } from '@/integrations/supabase/client';
import { getTodayDateRange } from './printUtils';

export const fetchProfessionalsData = async () => {
  console.log('Fetching professionals for print...');
  
  const { data: professionals, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
  
  console.log('Professionals fetched:', professionals?.length || 0);
  return professionals || [];
};

export const fetchDateAppointments = async (selectedDate?: Date, professionalId?: string) => {
  console.log('Fetching appointments for specific date:', selectedDate, 'professional:', professionalId);
  
  let startOfDay: Date;
  let endOfDay: Date;

  if (selectedDate) {
    // Use the selected date
    startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
  } else {
    // Use today's date as fallback
    const { startOfDay: todayStart, endOfDay: todayEnd } = getTodayDateRange();
    startOfDay = todayStart;
    endOfDay = todayEnd;
  }

  let query = supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      professional_id,
      procedure_id,
      start_time,
      end_time,
      status_id,
      notes,
      price,
      created_at,
      updated_at,
      patients!inner(full_name),
      professionals!inner(name),
      procedures(name),
      appointment_statuses!inner(label, color)
    `)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());

  // Add professional filter if specified
  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  const { data: appointments, error } = await query.order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching date appointments:', error);
    throw error;
  }

  const processedAppointments = appointments?.map(apt => ({
    ...apt,
    patients: apt.patients || { full_name: 'Paciente não informado' },
    professionals: apt.professionals || { name: 'Profissional não informado' },
    procedures: apt.procedures || { name: 'Sem procedimento' },
    appointment_statuses: apt.appointment_statuses || { label: 'Confirmado', color: '#10b981' }
  })) || [];

  console.log('Date appointments fetched:', processedAppointments.length);
  console.log('Sample appointment:', processedAppointments[0]);
  
  return processedAppointments;
};

export const fetchTodayAppointments = async () => {
  return fetchDateAppointments();
};

export const fetchAllAppointments = async (professionalId?: string) => {
  console.log('Fetching appointments for table print...', 'professional:', professionalId);
  
  let query = supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      professional_id,
      procedure_id,
      start_time,
      end_time,
      status_id,
      notes,
      price,
      created_at,
      updated_at,
      patients!inner(full_name),
      professionals!inner(name),
      procedures(name),
      appointment_statuses!inner(label, color)
    `);

  // Add professional filter if specified
  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  const { data: appointments, error } = await query.order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching all appointments:', error);
    throw error;
  }

  const processedAppointments = appointments?.map(apt => ({
    ...apt,
    patients: apt.patients || { full_name: 'Paciente não informado' },
    professionals: apt.professionals || { name: 'Profissional não informado' },
    procedures: apt.procedures || { name: 'Sem procedimento' },
    appointment_statuses: apt.appointment_statuses || { label: 'Confirmado', color: '#10b981' }
  })) || [];

  console.log('All appointments fetched:', processedAppointments.length);
  
  return processedAppointments;
};

export const fetchFilteredAppointments = async (
  filters: { statusId?: number; procedureId?: string },
  professionalId?: string
) => {
  console.log('Fetching filtered appointments:', filters, 'professional:', professionalId);
  
  let query = supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      professional_id,
      procedure_id,
      start_time,
      end_time,
      status_id,
      notes,
      price,
      created_at,
      updated_at,
      patients!inner(full_name),
      professionals!inner(name),
      procedures(name),
      appointment_statuses!inner(label, color)
    `);

  // Apply filters
  if (filters.statusId) {
    query = query.eq('status_id', filters.statusId);
  }

  if (filters.procedureId) {
    query = query.eq('procedure_id', filters.procedureId);
  }

  // Add professional filter if specified
  if (professionalId) {
    query = query.eq('professional_id', professionalId);
  }

  const { data: appointments, error } = await query.order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching filtered appointments:', error);
    throw error;
  }

  const processedAppointments = appointments?.map(apt => ({
    ...apt,
    patients: apt.patients || { full_name: 'Paciente não informado' },
    professionals: apt.professionals || { name: 'Profissional não informado' },
    procedures: apt.procedures || { name: 'Sem procedimento' },
    appointment_statuses: apt.appointment_statuses || { label: 'Confirmado', color: '#10b981' }
  })) || [];

  console.log('Filtered appointments fetched:', processedAppointments.length);
  
  return processedAppointments;
};

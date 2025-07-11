
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

export const fetchTodayAppointments = async () => {
  console.log('Fetching appointments for calendar print...');
  
  const { startOfDay, endOfDay } = getTodayDateRange();

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      professional_id,
      procedure_id,
      start_time,
      end_time,
      status,
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
    .lte('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching today appointments:', error);
    throw error;
  }

  const processedAppointments = appointments?.map(apt => ({
    ...apt,
    patients: apt.patients || { full_name: 'Paciente não informado' },
    professionals: apt.professionals || { name: 'Profissional não informado' },
    procedures: apt.procedures || { name: 'Sem procedimento' },
    appointment_statuses: apt.appointment_statuses || { label: 'Confirmado', color: '#10b981' }
  })) || [];

  console.log('Today appointments fetched:', processedAppointments.length);
  console.log('Sample appointment:', processedAppointments[0]);
  
  return processedAppointments;
};

export const fetchAllAppointments = async () => {
  console.log('Fetching appointments for table print...');
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      professional_id,
      procedure_id,
      start_time,
      end_time,
      status,
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
    .order('start_time', { ascending: true });

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


import { supabase } from '@/integrations/supabase/client';
import { getTodayDateRange } from './printUtils';

export const fetchProfessionalsData = async () => {
  console.log('Fetching professionals for print...');
  
  const { data: professionals, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return professionals || [];
};

export const fetchTodayAppointments = async () => {
  console.log('Fetching appointments for calendar print...');
  
  const { startOfDay, endOfDay } = getTodayDateRange();

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      notes,
      price,
      professional_id,
      patients(full_name),
      professionals(name),
      procedures(name),
      appointment_statuses(label, color)
    `)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  return appointments || [];
};

export const fetchAllAppointments = async () => {
  console.log('Fetching appointments for table print...');
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      notes,
      price,
      patients(full_name),
      professionals(name),
      procedures(name),
      appointment_statuses(label, color)
    `)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return appointments || [];
};


import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types';

export const fetchProfessionals = async (): Promise<Professional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  
  // Convert raw database data to properly typed Professional objects
  const processedData: Professional[] = (data || []).map(prof => ({
    id: prof.id,
    name: prof.name,
    specialty: prof.specialty || '',
    email: prof.email || '',
    phone: prof.phone || '',
    color: prof.color || '#3b82f6',
    calendarColor: prof.color || '#3b82f6',
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
  
  return processedData;
};

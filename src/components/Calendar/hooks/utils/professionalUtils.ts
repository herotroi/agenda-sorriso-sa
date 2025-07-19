
import { supabase } from '@/integrations/supabase/client';

interface DatabaseProfessional {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  color?: string;
  crm_cro?: string;
  break_times?: Array<{ start: string; end: string }>;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: boolean[];
  working_hours?: any;
  active?: boolean;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const fetchProfessionals = async (): Promise<DatabaseProfessional[]> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  
  // Convert Json types to proper TypeScript types with proper type checking
  const processedData = data?.map(prof => ({
    ...prof,
    break_times: Array.isArray(prof.break_times) 
      ? (prof.break_times as Array<{ start: string; end: string }>) 
      : [],
    working_days: Array.isArray(prof.working_days) 
      ? (prof.working_days as boolean[]) 
      : [true, true, true, true, true, false, false],
    // Ensure color is always available for TimeBlock compatibility
    color: prof.color || '#3b82f6'
  })) || [];
  
  return processedData;
};


import { supabase } from '@/integrations/supabase/client';

interface Professional {
  id: string;
  name: string;
  color: string;
  break_times?: Array<{ start: string; end: string }>;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: boolean[];
}

export const fetchProfessionals = async (): Promise<Professional[]> => {
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
      : [true, true, true, true, true, false, false]
  })) || [];
  
  return processedData;
};

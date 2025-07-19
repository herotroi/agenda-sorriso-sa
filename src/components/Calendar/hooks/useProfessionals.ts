
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Professional } from '@/types';

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: Professional[] = (data || []).map(prof => ({
        ...prof,
        break_times: Array.isArray(prof.break_times) 
          ? prof.break_times 
          : (typeof prof.break_times === 'string' ? JSON.parse(prof.break_times || '[]') : []),
        working_days: Array.isArray(prof.working_days)
          ? prof.working_days
          : (typeof prof.working_days === 'string' ? JSON.parse(prof.working_days || '[true,true,true,true,true,false,false]') : [true,true,true,true,true,false,false]),
        working_hours: prof.working_hours || { start: "08:00", end: "18:00" }
      }));

      setProfessionals(transformedData);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar profissionais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [user]);

  return {
    professionals,
    loading,
    refetch: fetchProfessionals,
  };
}

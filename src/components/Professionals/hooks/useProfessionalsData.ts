
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Professional } from '@/types';

export function useProfessionalsData() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfessionals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
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

  const deleteProfessional = async (professionalId: string) => {  // Removido segundo parâmetro
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ active: false })
        .eq('id', professionalId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Profissional removido com sucesso',
      });

      fetchProfessionals();
    } catch (error) {
      console.error('Error deleting professional:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover profissional',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [user]);

  return {
    professionals,
    loading,
    fetchProfessionals,
    deleteProfessional,
  };
}

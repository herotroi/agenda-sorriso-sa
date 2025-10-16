
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
        .order('created_at', { ascending: true }); // Maintain creation order

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
        working_hours: typeof prof.working_hours === 'object' && prof.working_hours !== null
          ? prof.working_hours as { start: string; end: string }
          : { start: "08:00", end: "18:00" },
        active: prof.active ?? true
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

  const deleteProfessional = async (professionalId: string) => {
    try {
      // Verificar se o profissional tem agendamentos ou prontuários
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .limit(1);

      const { data: records } = await supabase
        .from('patient_records')
        .select('id')
        .eq('professional_id', professionalId)
        .limit(1);

      const hasHistory = (appointments && appointments.length > 0) || (records && records.length > 0);

      if (hasHistory) {
        // Se tem histórico, apenas desativa
        const { error } = await supabase
          .from('professionals')
          .update({ active: false })
          .eq('id', professionalId)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: 'Profissional desativado',
          description: 'Profissional desativado (possui histórico de atendimentos)',
        });
      } else {
        // Se não tem histórico, exclui permanentemente
        const { error } = await supabase
          .from('professionals')
          .delete()
          .eq('id', professionalId)
          .eq('user_id', user?.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Profissional excluído com sucesso',
        });
      }

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

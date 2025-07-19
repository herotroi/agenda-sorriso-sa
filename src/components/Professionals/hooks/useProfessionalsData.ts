import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Professional } from '@/types';

export const useProfessionalsData = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfessionals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      // Transform the data to match the Professional interface from types/index.ts
      const transformedProfessionals: Professional[] = (data || []).map(prof => ({
        id: prof.id,
        name: prof.name,
        specialty: prof.specialty || '',
        email: prof.email || '',
        phone: prof.phone || '',
        color: prof.color,
        calendarColor: prof.color,
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

      setProfessionals(transformedProfessionals);
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
      const { error } = await supabase
        .from('professionals')
        .update({ active: false })
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Profissional removido com sucesso',
      });

      await fetchProfessionals();
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
    deleteProfessional,
    refetchProfessionals: fetchProfessionals
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Professional } from '@/types';

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
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      // Map database fields to frontend interface
      const mappedProfessionals = (data || []).map(prof => ({
        id: prof.id,
        name: prof.name,
        specialty: prof.specialty || '',
        email: prof.email || '',
        phone: prof.phone || '',
        cro: prof.crm_cro || '',
        services: [],
        workingHours: {
          monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          saturday: { isWorking: false, startTime: '08:00', endTime: '18:00' },
          sunday: { isWorking: false, startTime: '08:00', endTime: '18:00' }
        },
        calendarColor: prof.color || '#3b82f6',
        isActive: prof.active,
        documents: [],
        createdAt: prof.created_at,
        // Include database fields for compatibility - ensure color is always present
        color: prof.color || '#3b82f6',
        working_hours: prof.working_hours,
        active: prof.active,
        crm_cro: prof.crm_cro,
        first_shift_start: prof.first_shift_start,
        first_shift_end: prof.first_shift_end,
        second_shift_start: prof.second_shift_start,
        second_shift_end: prof.second_shift_end,
        vacation_active: prof.vacation_active,
        vacation_start: prof.vacation_start,
        vacation_end: prof.vacation_end,
        break_times: prof.break_times,
        working_days: Array.isArray(prof.working_days) ? prof.working_days as boolean[] : [true, true, true, true, true, false, false],
        weekend_shift_active: prof.weekend_shift_active,
        weekend_shift_start: prof.weekend_shift_start,
        weekend_shift_end: prof.weekend_shift_end,
        updated_at: prof.updated_at,
        user_id: prof.user_id
      }));

      setProfessionals(mappedProfessionals);
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
}

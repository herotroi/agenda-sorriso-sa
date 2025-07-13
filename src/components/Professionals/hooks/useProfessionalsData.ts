
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
        createdAt: prof.created_at
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

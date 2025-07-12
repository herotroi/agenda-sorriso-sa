
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient } from '@/types/prontuario';

export function usePatientsData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf, phone, email, active')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  return {
    patients,
    fetchPatients,
  };
}

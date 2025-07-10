
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Patient } from '@/types/prontuario';

export function usePatientsData() {
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf, phone, email, active')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    fetchPatients,
  };
}

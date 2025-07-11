
import { useState, useEffect } from 'react';
import { fetchProfessionals } from './utils/professionalUtils';

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

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfessionals = async () => {
    try {
      const data = await fetchProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  return {
    professionals,
    loading,
    refetch: loadProfessionals
  };
}

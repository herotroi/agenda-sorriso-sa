
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

export function usePatientRecords(patientId: string) {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!patientId || !user) {
      setRecords([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select(`
          *,
          professionals(name),
          appointments(
            start_time,
            procedures(name)
          )
        `)
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching patient records:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar registros do prontuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId, user?.id]);

  return {
    records,
    loading,
    refetchRecords: fetchRecords,
  };
}

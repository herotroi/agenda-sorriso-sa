import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('America/Sao_Paulo');
  const { user } = useAuth();

  useEffect(() => {
    loadTimezone();
  }, [user]);

  const loadTimezone = async () => {
    if (!user) {
      setTimezone('America/Sao_Paulo');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.timezone) {
        setTimezone(data.timezone);
      }
    } catch (error) {
      console.error('Error loading timezone:', error);
      setTimezone('America/Sao_Paulo');
    }
  };

  return { timezone };
}

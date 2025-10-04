import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ICDResult {
  code: string;
  title: string;
  version: string;
  id: string;
}

export function useICDSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ICDResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchICD = useCallback(async (query: string, version: '10' | '11' = '11') => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-icd', {
        body: { query: query.trim(), version, language: 'pt' }
      });

      if (functionError) {
        throw functionError;
      }

      setResults(data?.results || []);
    } catch (err) {
      console.error('Error searching ICD:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar códigos CID';
      setError(errorMessage);
      toast({
        title: 'Erro na busca',
        description: errorMessage,
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    searchICD,
    loading,
    results,
    error,
    clearResults,
  };
}

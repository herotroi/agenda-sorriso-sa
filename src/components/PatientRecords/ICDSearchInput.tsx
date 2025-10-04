import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useICDSearch, ICDResult } from '@/hooks/useICDSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ICDSearchInputProps {
  onSelect: (code: string, version: string) => void;
  initialCode?: string;
  initialVersion?: string;
}

export function ICDSearchInput({ onSelect, initialCode, initialVersion }: ICDSearchInputProps) {
  const [query, setQuery] = useState(initialCode || '');
  const [version, setVersion] = useState<'10' | '11'>((initialVersion === 'CID-11' ? '11' : '10') as '10' | '11');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { searchICD, loading, results, clearResults } = useICDSearch();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debounce da busca com auto-detecção da versão pelo padrão do código
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const q = query.trim();
    if (q.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        // Detectar padrão: CID-10 (A00, A06.0, B24...) vs CID-11 (6A05, 8C20.1...)
        const looksICD10 = /^[A-Za-z][0-9]{1,3}(\.[0-9A-Za-z]+)?$/i.test(q);
        const looksICD11 = /^[0-9][A-Za-z][0-9A-Za-z.]*$/i.test(q);
        let useVersion: '10' | '11' = version;
        if (looksICD10) useVersion = '10';
        else if (looksICD11) useVersion = '11';

        if (useVersion !== version) setVersion(useVersion);
        searchICD(q, useVersion);
        setShowResults(true);
      }, 600); // Aumentado para 600ms para evitar buscas excessivas
    } else {
      clearResults();
      setShowResults(false);
    }

    // Não limpar o timeout no cleanup para evitar cancelar buscas em andamento
  }, [query, version, searchICD, clearResults]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: ICDResult) => {
    setQuery(`${result.code} - ${result.title}`);
    onSelect(result.code, result.version);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="icd-search">CID (código ou descrição)</Label>
      <div className="flex gap-2">
        <Select value={version} onValueChange={(v) => setVersion(v as '10' | '11')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">CID-10</SelectItem>
            <SelectItem value="11">CID-11</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1" ref={resultsRef}>
          <div className="relative">
            <Input
              id="icd-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.trim().length >= 2 && setShowResults(true)}
              placeholder="Buscar por código ou descrição..."
              className="pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                    index === selectedIndex ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {result.code}
                    </Badge>
                    <span className="text-sm flex-1">{result.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && !loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
              Nenhum código encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

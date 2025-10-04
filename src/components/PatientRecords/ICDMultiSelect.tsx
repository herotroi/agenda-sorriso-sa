import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useICDSearch, ICDResult } from '@/hooks/useICDSearch';
import { Loader2, Search, X } from 'lucide-react';
import { ICDCode } from '@/types/prontuario';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ICDMultiSelectProps {
  selectedCodes: ICDCode[];
  onCodesChange: (codes: ICDCode[]) => void;
  maxCodes?: number;
}

export function ICDMultiSelect({ selectedCodes, onCodesChange, maxCodes = 10 }: ICDMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState<'10' | '11'>('11');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { searchICD, loading, results, clearResults } = useICDSearch();

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        // Auto-detect version based on query pattern
        const q = query.trim();
        const useVersion = /^[0-9]/.test(q) ? '11' : version;
        if (useVersion !== version) setVersion(useVersion);
        searchICD(q, useVersion);
        setShowResults(true);
      }, 600);
    } else {
      clearResults();
      setShowResults(false);
    }
  }, [query, version, searchICD, clearResults]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: ICDResult) => {
    // Check if already selected
    const isDuplicate = selectedCodes.some(
      (code) => code.code === result.code && code.version === result.version
    );

    if (isDuplicate) {
      return; // Don't add duplicates
    }

    if (selectedCodes.length >= maxCodes) {
      return; // Don't exceed max codes
    }

    const newCode: ICDCode = {
      code: result.code,
      version: result.version,
      title: result.title,
    };

    onCodesChange([...selectedCodes, newCode]);
    setQuery('');
    setShowResults(false);
    setSelectedIndex(0);
  };

  const handleRemove = (index: number) => {
    onCodesChange(selectedCodes.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Códigos CID {selectedCodes.length > 0 && `(${selectedCodes.length}/${maxCodes})`}</Label>
        
        <div className="flex gap-2" ref={dropdownRef}>
          <Select value={version} onValueChange={(v: '10' | '11') => setVersion(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">CID-10</SelectItem>
              <SelectItem value="11">CID-11</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar código ou descrição..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={selectedCodes.length >= maxCodes}
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
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-auto">
                {results.map((result, idx) => (
                  <button
                    key={`${result.code}-${result.version}-${idx}`}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                      idx === selectedIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="font-medium">
                      {result.code} - {result.version}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{result.title}</div>
                  </button>
                ))}
              </div>
            )}

            {showResults && query.trim().length >= 2 && results.length === 0 && !loading && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3 text-sm text-muted-foreground">
                Nenhum código encontrado
              </div>
            )}
          </div>
        </div>

        {selectedCodes.length >= maxCodes && (
          <p className="text-xs text-muted-foreground">
            Limite máximo de {maxCodes} códigos atingido
          </p>
        )}
      </div>

      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {selectedCodes.map((code, index) => (
              <Tooltip key={`${code.code}-${code.version}-${index}`}>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="pr-1 max-w-[200px]">
                    <span className="truncate">
                      {code.code} - {code.version}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{code.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

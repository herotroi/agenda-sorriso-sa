
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types/prontuario';

interface PatientSearchProps {
  patients: Patient[];
  selectedPatient: string;
  onPatientSelect: (patientId: string) => void;
}

export function PatientSearch({ patients, selectedPatient, onPatientSelect }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memoized filtering and sorting for better performance
  const filteredAndSortedPatients = useMemo(() => {
    // Filter only active patients belonging to the current user
    const activePatients = patients.filter(patient => patient.active !== false);
    
    if (!searchTerm.trim()) {
      return activePatients.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = activePatients.filter(patient => {
      const nameMatch = patient.full_name.toLowerCase().includes(searchLower);
      const cpfMatch = patient.cpf && patient.cpf.includes(searchTerm);
      const phoneMatch = patient.phone && patient.phone.includes(searchTerm);
      
      return nameMatch || cpfMatch || phoneMatch;
    });
    
    // Sort by relevance: exact matches first, then partial matches
    return filtered.sort((a, b) => {
      const aName = a.full_name.toLowerCase();
      const bName = b.full_name.toLowerCase();
      
      // Exact name matches come first
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
      
      // Then alphabetical order
      return aName.localeCompare(bName);
    });
  }, [patients, searchTerm]);

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearSelection = () => {
    onPatientSelect('');
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 text-black px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Buscar Paciente
          {selectedPatient && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Seleção
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Digite nome, CPF ou telefone..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedPatients.length === 0 ? (
              <span className="text-red-600">Nenhum paciente encontrado para "{searchTerm}"</span>
            ) : (
              <span>
                {filteredAndSortedPatients.length} paciente(s) encontrado(s)
                {filteredAndSortedPatients.length !== patients.filter(p => p.active !== false).length && 
                  ` de ${patients.filter(p => p.active !== false).length} total`
                }
              </span>
            )}
          </div>
        )}
        
        <Select value={selectedPatient || 'no_selection'} onValueChange={(value) => onPatientSelect(value === 'no_selection' ? '' : value)}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Selecione um paciente" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-60 overflow-y-auto">
              {filteredAndSortedPatients.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {searchTerm ? `Nenhum paciente encontrado para "${searchTerm}"` : 'Nenhum paciente ativo disponível'}
                </div>
              ) : (
                <>
                  <SelectItem value="no_selection">Selecione um paciente</SelectItem>
                  {filteredAndSortedPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex flex-col w-full">
                        <span className="font-medium">
                          {getHighlightedText(patient.full_name, searchTerm)}
                        </span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {patient.cpf && (
                            <span>CPF: {getHighlightedText(patient.cpf, searchTerm)}</span>
                          )}
                          {patient.phone && (
                            <span>Tel: {getHighlightedText(patient.phone, searchTerm)}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </div>
          </SelectContent>
        </Select>

        {selectedPatientData && (
          <div className="p-4 bg-muted rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{selectedPatientData.full_name}</h4>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                Selecionado
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {selectedPatientData.cpf && <p><strong>CPF:</strong> {selectedPatientData.cpf}</p>}
              {selectedPatientData.phone && <p><strong>Telefone:</strong> {selectedPatientData.phone}</p>}
              {selectedPatientData.email && <p><strong>Email:</strong> {selectedPatientData.email}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

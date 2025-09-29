
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Patient } from '@/types/prontuario';

interface PatientSearchProps {
  patients: Patient[];
  selectedPatient: string;
  onPatientSelect: (patientId: string) => void;
}

export function PatientSearch({ patients, selectedPatient, onPatientSelect }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return patients;
    }
    
    return patients.filter(patient => 
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf?.includes(searchTerm) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleClearSelection = () => {
    onPatientSelect('');
    setSearchTerm('');
  };

  const handlePatientSelect = (patientId: string) => {
    onPatientSelect(patientId);
    setSearchTerm(''); // Limpar busca após seleção
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Pesquisar paciente por nome, CPF, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Patient Info */}
      {selectedPatientData && !searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 truncate">{selectedPatientData.full_name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-blue-700">
                {selectedPatientData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedPatientData.phone}</span>
                  </span>
                )}
                {selectedPatientData.cpf && (
                  <span className="truncate">CPF: {selectedPatientData.cpf}</span>
                )}
                {selectedPatientData.email && (
                  <span className="truncate">{selectedPatientData.email}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="default" className="bg-blue-600">
                Selecionado
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Patient List - Shown when searching */}
      {searchTerm && (
        <div className="border rounded-lg">
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-medium text-gray-900">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
              <span className="ml-2 text-gray-600">para "{searchTerm}"</span>
            </h4>
          </div>
          
          <ScrollArea className="h-64">
            {filteredPatients.length > 0 ? (
              <div className="divide-y">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
                          <div className="flex flex-col gap-1 mt-1">
                            {patient.phone && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{patient.phone}</span>
                              </span>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {patient.cpf && (
                                <span className="truncate">CPF: {patient.cpf}</span>
                              )}
                              {patient.email && (
                                <span className="truncate">{patient.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={patient.active ? 'default' : 'secondary'} 
                        className="text-xs flex-shrink-0 ml-2"
                      >
                        {patient.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum paciente encontrado</p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Tente buscar com outros termos' : 'Cadastre pacientes primeiro'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

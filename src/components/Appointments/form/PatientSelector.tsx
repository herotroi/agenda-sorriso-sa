
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User, Search } from 'lucide-react';
import { FormField } from './FormField';
import { Patient } from '@/types/patient';

interface PatientSelectorProps {
  patients: Patient[];
  value: string;
  onChange: (value: string) => void;
  currentPatientName?: string;
}

export function PatientSelector({ patients, value, onChange, currentPatientName }: PatientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter only active patients
  const activePatients = patients.filter(patient => patient.active !== false);
  
  // Filter patients based on search term
  const filteredPatients = activePatients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.cpf && patient.cpf.includes(searchTerm)) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  return (
    <FormField 
      label="Paciente" 
      required 
      currentValue={currentPatientName}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Selecione o paciente" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente ativo disponível'}
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{patient.full_name}</span>
                      {patient.cpf && (
                        <span className="text-xs text-muted-foreground">CPF: {patient.cpf}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </FormField>
  );
}

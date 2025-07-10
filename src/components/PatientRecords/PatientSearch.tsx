
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User } from 'lucide-react';
import { Patient } from '@/types/patient';

interface PatientSearchProps {
  patients: Patient[];
  selectedPatient: string;
  onPatientSelect: (patientId: string) => void;
}

export function PatientSearch({ patients, selectedPatient, onPatientSelect }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter active patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.active !== false && (
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.cpf && patient.cpf.includes(searchTerm)) ||
      (patient.phone && patient.phone.includes(searchTerm))
    )
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Digite nome, CPF ou telefone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedPatient} onValueChange={onPatientSelect}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Selecione um paciente" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <div className="max-h-60 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente ativo disponível'}
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex flex-col">
                      <span>{patient.full_name}</span>
                      {patient.cpf && (
                        <span className="text-xs text-muted-foreground">CPF: {patient.cpf}</span>
                      )}
                      {patient.phone && (
                        <span className="text-xs text-muted-foreground">Tel: {patient.phone}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </div>
          </SelectContent>
        </Select>

        {selectedPatientData && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium">{selectedPatientData.full_name}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {selectedPatientData.cpf && <p>CPF: {selectedPatientData.cpf}</p>}
              {selectedPatientData.phone && <p>Telefone: {selectedPatientData.phone}</p>}
              {selectedPatientData.email && <p>Email: {selectedPatientData.email}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

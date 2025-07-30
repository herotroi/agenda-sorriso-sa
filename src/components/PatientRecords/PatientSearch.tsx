
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Phone, FileText } from 'lucide-react';
import type { Patient } from '@/types/prontuario';

interface PatientSearchProps {
  patients: Patient[];
  selectedPatient: string;
  onPatientSelect: (patientId: string) => void;
}

export function PatientSearch({ patients, selectedPatient, onPatientSelect }: PatientSearchProps) {
  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="space-y-4">
      <Select value={selectedPatient} onValueChange={onPatientSelect}>
        <SelectTrigger className="h-14 text-base">
          <SelectValue placeholder="Digite o nome do paciente ou selecione da lista..." />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id} className="py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {patient.phone && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.cpf && (
                          <span className="text-sm text-gray-500">
                            CPF: {patient.cpf}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={patient.active ? 'default' : 'secondary'} className="text-xs">
                      {patient.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-patients" disabled>
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum paciente encontrado</p>
                <p className="text-sm mt-1">Cadastre pacientes primeiro</p>
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Selected Patient Info */}
      {selectedPatientData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">{selectedPatientData.full_name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-blue-700">
                {selectedPatientData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedPatientData.phone}
                  </span>
                )}
                {selectedPatientData.cpf && (
                  <span>CPF: {selectedPatientData.cpf}</span>
                )}
                {selectedPatientData.email && (
                  <span>{selectedPatientData.email}</span>
                )}
              </div>
            </div>
            <Badge variant="default" className="bg-blue-600">
              Selecionado
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

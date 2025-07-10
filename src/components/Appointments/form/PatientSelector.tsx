
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { FormField } from './FormField';
import { Patient } from '@/types/patient';

interface PatientSelectorProps {
  patients: Patient[];
  value: string;
  onChange: (value: string) => void;
  currentPatientName?: string;
}

export function PatientSelector({ patients, value, onChange, currentPatientName }: PatientSelectorProps) {
  // Filter out inactive patients
  const activePatients = patients.filter(patient => patient.active !== false);

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
          {activePatients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {patient.full_name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

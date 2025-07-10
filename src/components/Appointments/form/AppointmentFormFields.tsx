
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Patient {
  id: string;
  full_name: string;
}

interface Professional {
  id: string;
  name: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
}

interface AppointmentStatus {
  id: number;
  label: string;
  key: string;
}

interface FormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  duration: string;
  notes: string;
  status_id: number;
}

interface AppointmentFormFieldsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
}

export function AppointmentFormFields({
  formData,
  setFormData,
  patients,
  professionals,
  procedures,
  statuses,
  onProcedureChange
}: AppointmentFormFieldsProps) {
  
  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    console.log(`Changing field ${field} to:`, value);
    const updatedFormData = { ...formData, [field]: value };
    console.log('Updated form data:', updatedFormData);
    setFormData(updatedFormData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient">Paciente *</Label>
        <Select 
          value={formData.patient_id} 
          onValueChange={(value) => handleFieldChange('patient_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o paciente" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="professional">Profissional *</Label>
        <Select 
          value={formData.professional_id} 
          onValueChange={(value) => handleFieldChange('professional_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((prof) => (
              <SelectItem key={prof.id} value={prof.id}>
                {prof.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="procedure">Procedimento</Label>
        <Select 
          value={formData.procedure_id} 
          onValueChange={(value) => {
            console.log('Procedure selection changed:', value);
            onProcedureChange(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o procedimento" />
          </SelectTrigger>
          <SelectContent>
            {procedures.map((procedure) => (
              <SelectItem key={procedure.id} value={procedure.id}>
                {procedure.name} - R$ {procedure.price.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Data e Hora *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => {
              console.log('Start time changed:', e.target.value);
              handleFieldChange('start_time', e.target.value);
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duração (min)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => {
              console.log('Duration changed:', e.target.value);
              handleFieldChange('duration', e.target.value);
            }}
            min="15"
            step="15"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status_id.toString()} 
          onValueChange={(value) => {
            console.log('Status changed:', value);
            handleFieldChange('status_id', parseInt(value));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => {
            console.log('Notes changed:', e.target.value);
            handleFieldChange('notes', e.target.value);
          }}
          rows={3}
        />
      </div>
    </div>
  );
}


import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Patient, Professional, Procedure, AppointmentStatus, FormData } from '@/types/appointment-form';

interface AppointmentFormFieldsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  patients: Patient[];
  professionals: Professional[];
  procedures: Procedure[];
  statuses: AppointmentStatus[];
  onProcedureChange: (procedureId: string) => void;
  handleFieldChange: (field: keyof FormData, value: string | number) => void;
  originalData?: FormData | null;
  fieldModified?: Record<keyof FormData, boolean>;
}

export function AppointmentFormFields({
  formData,
  setFormData,
  patients,
  professionals,
  procedures,
  statuses,
  onProcedureChange,
  handleFieldChange,
  originalData,
  fieldModified
}: AppointmentFormFieldsProps) {
  
  const getDisplayValue = (field: keyof FormData, currentValue: string | number) => {
    if (!originalData || !fieldModified) return currentValue;
    
    if (fieldModified[field]) {
      return currentValue;
    }
    
    return originalData[field];
  };

  const getPatientDisplayName = () => {
    if (!originalData || !fieldModified || fieldModified.patient_id) {
      const patient = patients.find(p => p.id === formData.patient_id);
      return patient ? patient.full_name : 'Selecione o paciente';
    }
    
    const originalPatient = patients.find(p => p.id === originalData.patient_id);
    return originalPatient ? originalPatient.full_name : 'Selecione o paciente';
  };

  const getProfessionalDisplayName = () => {
    if (!originalData || !fieldModified || fieldModified.professional_id) {
      const professional = professionals.find(p => p.id === formData.professional_id);
      return professional ? professional.name : 'Selecione o profissional';
    }
    
    const originalProfessional = professionals.find(p => p.id === originalData.professional_id);
    return originalProfessional ? originalProfessional.name : 'Selecione o profissional';
  };

  const getProcedureDisplayName = () => {
    if (!originalData || !fieldModified || fieldModified.procedure_id) {
      const procedure = procedures.find(p => p.id === formData.procedure_id);
      return procedure ? `${procedure.name} - R$ ${procedure.price.toFixed(2)}` : 'Selecione o procedimento';
    }
    
    const originalProcedure = procedures.find(p => p.id === originalData.procedure_id);
    return originalProcedure ? `${originalProcedure.name} - R$ ${originalProcedure.price.toFixed(2)}` : 'Selecione o procedimento';
  };

  const getStatusDisplayName = () => {
    if (!originalData || !fieldModified || fieldModified.status_id) {
      const status = statuses.find(s => s.id === formData.status_id);
      return status ? status.label : 'Selecione o status';
    }
    
    const originalStatus = statuses.find(s => s.id === originalData.status_id);
    return originalStatus ? originalStatus.label : 'Selecione o status';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient">Paciente *</Label>
        <Select 
          value={fieldModified?.patient_id ? formData.patient_id : (originalData?.patient_id || formData.patient_id)}
          onValueChange={(value) => handleFieldChange('patient_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={getPatientDisplayName()} />
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
          value={fieldModified?.professional_id ? formData.professional_id : (originalData?.professional_id || formData.professional_id)}
          onValueChange={(value) => handleFieldChange('professional_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={getProfessionalDisplayName()} />
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
          value={fieldModified?.procedure_id ? formData.procedure_id : (originalData?.procedure_id || formData.procedure_id)}
          onValueChange={(value) => onProcedureChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={getProcedureDisplayName()} />
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
            value={getDisplayValue('start_time', formData.start_time) as string}
            onChange={(e) => handleFieldChange('start_time', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duração (min)</Label>
          <Input
            id="duration"
            type="number"
            value={getDisplayValue('duration', formData.duration) as string}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            min="15"
            step="15"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={(fieldModified?.status_id ? formData.status_id : (originalData?.status_id || formData.status_id)).toString()}
          onValueChange={(value) => handleFieldChange('status_id', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder={getStatusDisplayName()} />
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
          value={getDisplayValue('notes', formData.notes) as string}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder={originalData?.notes ? `Original: ${originalData.notes}` : 'Digite suas observações...'}
          rows={3}
        />
      </div>
    </div>
  );
}

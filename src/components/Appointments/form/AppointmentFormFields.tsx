
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

  const getCurrentPatientName = () => {
    if (!originalData) return '';
    const patient = patients.find(p => p.id === originalData.patient_id);
    return patient ? patient.full_name : '';
  };

  const getCurrentProfessionalName = () => {
    if (!originalData) return '';
    const professional = professionals.find(p => p.id === originalData.professional_id);
    return professional ? professional.name : '';
  };

  const getCurrentProcedureName = () => {
    if (!originalData) return '';
    const procedure = procedures.find(p => p.id === originalData.procedure_id);
    return procedure ? `${procedure.name} - R$ ${procedure.price.toFixed(2)}` : '';
  };

  const getCurrentStatusName = () => {
    if (!originalData) return '';
    const status = statuses.find(s => s.id === originalData.status_id);
    return status ? status.label : '';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="patient">
          Paciente * {originalData && getCurrentPatientName() && (
            <span className="text-sm text-muted-foreground font-normal">
              (Atual: {getCurrentPatientName()})
            </span>
          )}
        </Label>
        <Select 
          value={fieldModified?.patient_id ? formData.patient_id : ''}
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
        <Label htmlFor="professional">
          Profissional * {originalData && getCurrentProfessionalName() && (
            <span className="text-sm text-muted-foreground font-normal">
              (Atual: {getCurrentProfessionalName()})
            </span>
          )}
        </Label>
        <Select 
          value={fieldModified?.professional_id ? formData.professional_id : ''}
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
        <Label htmlFor="procedure">
          Procedimento {originalData && getCurrentProcedureName() && (
            <span className="text-sm text-muted-foreground font-normal">
              (Atual: {getCurrentProcedureName()})
            </span>
          )}
        </Label>
        <Select 
          value={fieldModified?.procedure_id ? formData.procedure_id : ''}
          onValueChange={(value) => onProcedureChange(value)}
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
          <Label htmlFor="start_time">
            Data e Hora * {originalData && originalData.start_time && (
              <span className="text-sm text-muted-foreground font-normal">
                (Atual: {new Date(originalData.start_time).toLocaleString('pt-BR')})
              </span>
            )}
          </Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={getDisplayValue('start_time', formData.start_time) as string}
            onChange={(e) => handleFieldChange('start_time', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">
            Duração (min) {originalData && originalData.duration && (
              <span className="text-sm text-muted-foreground font-normal">
                (Atual: {originalData.duration} min)
              </span>
            )}
          </Label>
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
        <Label htmlFor="status">
          Status {originalData && getCurrentStatusName() && (
            <span className="text-sm text-muted-foreground font-normal">
              (Atual: {getCurrentStatusName()})
            </span>
          )}
        </Label>
        <Select 
          value={fieldModified?.status_id ? formData.status_id.toString() : ''}
          onValueChange={(value) => handleFieldChange('status_id', parseInt(value))}
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
        <Label htmlFor="notes">
          Observações {originalData && originalData.notes && (
            <span className="text-sm text-muted-foreground font-normal">
              (Atual: {originalData.notes.length > 30 ? originalData.notes.substring(0, 30) + '...' : originalData.notes})
            </span>
          )}
        </Label>
        <Textarea
          id="notes"
          value={getDisplayValue('notes', formData.notes) as string}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Digite suas observações..."
          rows={3}
        />
      </div>
    </div>
  );
}

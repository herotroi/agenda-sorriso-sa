
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useAppointmentAutoSave } from '@/hooks/useAppointmentAutoSave';
import { useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  appointmentToEdit?: any;
  selectedProfessionalId?: string;
}

export function AppointmentForm({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(), 
  appointmentToEdit,
  selectedProfessionalId 
}: AppointmentFormProps) {
  const {
    patients,
    professionals,
    procedures,
    statuses,
    formData,
    setFormData,
    handleProcedureChange,
    handleFieldChange,
    originalData,
    fieldModified,
    getFinalFormData,
    resetFieldModifications
  } = useAppointmentFormData(isOpen, appointmentToEdit, selectedDate, selectedProfessionalId);

  const { autoSave, manualSave, isSaving } = useAppointmentAutoSave(
    procedures,
    appointmentToEdit,
    () => {
      resetFieldModifications();
    }
  );

  // Auto-save quando há mudanças no formulário (apenas para edição)
  useEffect(() => {
    if (appointmentToEdit && Object.values(fieldModified).some(Boolean)) {
      const timeoutId = setTimeout(() => {
        const finalData = getFinalFormData();
        autoSave(finalData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, fieldModified, appointmentToEdit, autoSave, getFinalFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = getFinalFormData();
    
    const success = await manualSave(finalData);
    if (success) {
      onClose();
    }
  };

  const handleProcedureSelectChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    const duration = procedure ? procedure.default_duration.toString() : formData.duration;
    
    setFormData(prev => ({
      ...prev,
      procedure_id: procedureId,
      duration: duration
    }));
    
    handleFieldChange('procedure_id', procedureId);
    handleFieldChange('duration', duration);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select value={formData.patient_id} onValueChange={(value) => handleFieldChange('patient_id', value)}>
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
              <Label htmlFor="professional_id">Profissional *</Label>
              <Select value={formData.professional_id} onValueChange={(value) => handleFieldChange('professional_id', value)}>
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
          </div>

          <div>
            <Label htmlFor="procedure_id">Procedimento</Label>
            <Select value={formData.procedure_id} onValueChange={handleProcedureSelectChange}>
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
                onChange={(e) => handleFieldChange('start_time', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleFieldChange('duration', e.target.value)}
                placeholder="60"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status_id">Status</Label>
            <Select value={formData.status_id.toString()} onValueChange={(value) => handleFieldChange('status_id', parseInt(value))}>
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
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
              placeholder="Observações sobre o agendamento..."
            />
          </div>

          {appointmentToEdit && (
            <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
              💡 As alterações são salvas automaticamente
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !formData.patient_id || !formData.professional_id}>
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>{appointmentToEdit ? 'Salvar' : 'Criar'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

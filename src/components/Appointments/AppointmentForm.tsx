import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentValidation } from '@/hooks/useAppointmentValidation';

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

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  appointment?: any;
}

const statusOptions = [
  { value: 'Confirmado', label: 'Confirmado' },
  { value: 'Cancelado', label: 'Cancelado' },
  { value: 'Não Compareceu', label: 'Não Compareceu' },
  { value: 'Em atendimento', label: 'Em atendimento' },
  { value: 'Finalizado', label: 'Finalizado' }
];

export function AppointmentForm({ isOpen, onClose, selectedDate, appointment }: AppointmentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    professional_id: '',
    procedure_id: '',
    start_time: '',
    duration: '60',
    notes: '',
    status: 'Confirmado',
  });
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { checkTimeConflict, validateTimeSlot } = useAppointmentValidation();

  const fetchData = async () => {
    try {
      const [patientsRes, professionalsRes, proceduresRes] = await Promise.all([
        supabase.from('patients').select('id, full_name').order('full_name'),
        supabase.from('professionals').select('id, name').eq('active', true).order('name'),
        supabase.from('procedures').select('*').eq('active', true).order('name')
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (proceduresRes.error) throw proceduresRes.error;

      setPatients(patientsRes.data || []);
      setProfessionals(professionalsRes.data || []);
      setProcedures(proceduresRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (appointment) {
        // Edit mode
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        
        setFormData({
          patient_id: appointment.patient_id || '',
          professional_id: appointment.professional_id || '',
          procedure_id: appointment.procedure_id || '',
          start_time: startTime.toISOString().slice(0, 16),
          duration: duration.toString(),
          notes: appointment.notes || '',
          status: appointment.status || 'Confirmado',
        });
      } else {
        // Create mode
        const defaultTime = selectedDate.toISOString().split('T')[0] + 'T09:00';
        setFormData({
          patient_id: '',
          professional_id: '',
          procedure_id: '',
          start_time: defaultTime,
          duration: '60',
          notes: '',
          status: 'Confirmado',
        });
      }
    }
  }, [isOpen, selectedDate, appointment]);

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    setFormData({
      ...formData,
      procedure_id: procedureId,
      duration: procedure ? procedure.default_duration.toString() : '60'
    });
  };

  const validateForm = async (): Promise<boolean> => {
    if (!formData.patient_id || !formData.professional_id || !formData.start_time) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return false;
    }

    const startTime = new Date(formData.start_time);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + parseInt(formData.duration));

    // Validate time slot
    const { isValid, message } = validateTimeSlot(startTime.toISOString(), endTime.toISOString());
    if (!isValid) {
      toast({
        title: 'Horário inválido',
        description: message,
        variant: 'destructive',
      });
      return false;
    }

    // Check for conflicts
    setIsValidating(true);
    const { hasConflict, message: conflictMessage } = await checkTimeConflict(
      formData.professional_id,
      startTime.toISOString(),
      endTime.toISOString(),
      appointment?.id
    );
    setIsValidating(false);

    if (hasConflict) {
      toast({
        title: 'Conflito de horário',
        description: conflictMessage,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateForm();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(formData.duration));

      const procedure = procedures.find(p => p.id === formData.procedure_id);

      const appointmentData = {
        patient_id: formData.patient_id,
        professional_id: formData.professional_id,
        procedure_id: formData.procedure_id || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        price: procedure?.price || null,
        notes: formData.notes || null,
        status: formData.status
      };

      let error;
      if (appointment) {
        // Update existing appointment
        const { error: updateError } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id);
        error = updateError;
      } else {
        // Create new appointment
        const { error: insertError } = await supabase
          .from('appointments')
          .insert(appointmentData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: appointment ? 'Agendamento atualizado com sucesso' : 'Agendamento criado com sucesso',
      });

      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Paciente *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
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
            <Select value={formData.professional_id} onValueChange={(value) => setFormData({ ...formData, professional_id: value })}>
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
            <Select value={formData.procedure_id} onValueChange={handleProcedureChange}>
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
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="15"
                step="15"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isValidating || !formData.patient_id || !formData.professional_id}
            >
              {loading || isValidating ? 'Validando...' : appointment ? 'Atualizar' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

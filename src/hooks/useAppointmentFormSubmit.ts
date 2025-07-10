
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentValidation } from '@/hooks/useAppointmentValidation';
import { FormData } from '@/types/appointment-form';

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
}

export function useAppointmentFormSubmit(
  procedures: Procedure[],
  appointmentToEdit: any,
  onClose: (success?: boolean) => void
) {
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { checkTimeConflict, validateTimeSlot } = useAppointmentValidation();

  const validateForm = async (formData: FormData): Promise<boolean> => {
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

    const { isValid, message } = validateTimeSlot(startTime.toISOString(), endTime.toISOString());
    if (!isValid) {
      toast({
        title: 'Horário inválido',
        description: message,
        variant: 'destructive',
      });
      return false;
    }

    setIsValidating(true);
    const { hasConflict, message: conflictMessage } = await checkTimeConflict(
      formData.professional_id,
      startTime.toISOString(),
      endTime.toISOString(),
      appointmentToEdit?.id
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

  const handleSubmit = async (e: React.FormEvent, formData: FormData) => {
    e.preventDefault();
    
    console.log('=== SUBMIT DEBUG ===');
    console.log('appointmentToEdit:', appointmentToEdit);
    console.log('formData:', formData);
    console.log('Is editing?', !!appointmentToEdit);
    
    const isFormValid = await validateForm(formData);
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
        status_id: formData.status_id
      };

      console.log('Appointment data to save:', appointmentData);

      let error;
      if (appointmentToEdit && appointmentToEdit.id) {
        console.log('UPDATING appointment with ID:', appointmentToEdit.id);
        const { error: updateError } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointmentToEdit.id);
        error = updateError;
      } else {
        console.log('CREATING new appointment');
        const { error: insertError } = await supabase
          .from('appointments')
          .insert(appointmentData);
        error = insertError;
      }

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: appointmentToEdit ? 'Agendamento atualizado com sucesso' : 'Agendamento criado com sucesso',
      });

      onClose(true);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento',
        variant: 'destructive',
      });
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isValidating,
    handleSubmit
  };
}


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppointmentFormData } from '@/types/appointment-form';

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
}

export function useAppointmentAutoSave(
  procedures: Procedure[],
  appointmentToEdit: any,
  onSuccess?: () => void
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<AppointmentFormData | null>(null);
  const { toast } = useToast();

  const autoSave = useCallback(async (formData: AppointmentFormData) => {
    if (!appointmentToEdit) return;

    // Verificar se os dados mudaram desde a última salvagem
    if (lastSavedData && JSON.stringify(formData) === JSON.stringify(lastSavedData)) {
      return;
    }

    setIsSaving(true);
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

      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentToEdit.id);

      if (error) throw error;

      setLastSavedData(formData);
      
      toast({
        title: 'Salvo automaticamente',
        description: 'Alterações salvas com sucesso',
        duration: 2000,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error auto-saving appointment:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Erro ao salvar alterações automaticamente',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [procedures, appointmentToEdit, lastSavedData, toast, onSuccess]);

  const manualSave = useCallback(async (formData: AppointmentFormData) => {
    setIsSaving(true);
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

      let error;
      if (appointmentToEdit) {
        const { error: updateError } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointmentToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('appointments')
          .insert(appointmentData);
        error = insertError;
      }

      if (error) throw error;

      setLastSavedData(formData);
      
      toast({
        title: 'Sucesso',
        description: appointmentToEdit ? 'Agendamento atualizado com sucesso' : 'Agendamento criado com sucesso',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar agendamento',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [procedures, appointmentToEdit, toast, onSuccess]);

  return {
    autoSave,
    manualSave,
    isSaving
  };
}

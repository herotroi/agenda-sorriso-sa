
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentValidation } from '@/hooks/useAppointmentValidation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { AppointmentFormData } from '@/types/appointment-form';
import { parseLocalDateTime } from '@/utils/timezoneUtils';

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
  const { user } = useAuth();
  const { checkLimit, showLimitWarning } = useSubscriptionLimits();

  const validateForm = async (formData: AppointmentFormData): Promise<boolean> => {
    // Verificar limite de agendamentos para novos agendamentos
    if (!appointmentToEdit && !checkLimit('appointment')) {
      showLimitWarning('appointment');
      return false;
    }

    // Para agendamentos bloqueados, apenas validar campos obrigatórios básicos
    if (formData.is_blocked) {
      if (!formData.professional_id || !formData.start_time) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha profissional e horário para o bloqueio',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      // Validação completa para agendamentos normais
      if (!formData.patient_id || !formData.professional_id || !formData.procedure_id || !formData.start_time) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive',
        });
        return false;
      }
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
        duration: 8000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent, formData: AppointmentFormData) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }
    
    const isFormValid = await validateForm(formData);
    if (!isFormValid) return;

    setLoading(true);
    try {
      // Criar data no timezone local
      const startDate = parseLocalDateTime(formData.start_time);
      
      // Calcular end_time baseado na duração
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + parseInt(formData.duration));

      // Formatar para timestamp sem timezone (formato: YYYY-MM-DD HH:mm:ss)
      const formatTimestamp = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const startTime = formatTimestamp(startDate);
      const endTime = formatTimestamp(endDate);

      console.log('📅 Appointment times:', {
        input: formData.start_time,
        startDate: startTime,
        endDate: endTime,
        localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      const procedure = procedures.find(p => p.id === formData.procedure_id);

      const appointmentData = {
        patient_id: formData.is_blocked ? null : formData.patient_id,
        professional_id: formData.professional_id,
        procedure_id: formData.is_blocked ? null : (formData.procedure_id || null),
        start_time: startTime,
        end_time: endTime,
        price: formData.is_blocked ? null : (procedure?.price || null),
        notes: formData.is_blocked ? (formData.notes || 'Horário bloqueado') : (formData.notes || null),
        status_id: formData.is_blocked ? 1 : formData.status_id,
        is_blocked: formData.is_blocked || false,
        payment_method: formData.is_blocked ? null : (formData.payment_method || null),
        payment_status: formData.is_blocked ? null : (formData.payment_status || null),
        user_id: user.id
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

      const successMessage = formData.is_blocked 
        ? (appointmentToEdit ? 'Bloqueio atualizado com sucesso' : 'Horário bloqueado com sucesso')
        : (appointmentToEdit ? 'Agendamento atualizado com sucesso' : 'Agendamento criado com sucesso');

      toast({
        title: 'Sucesso',
        description: successMessage,
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

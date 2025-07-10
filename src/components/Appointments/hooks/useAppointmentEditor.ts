
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Appointment, EditingCell } from '../types';
import { useAppointmentValidation } from './useAppointmentValidation';

export function useAppointmentEditor(
  appointments: Appointment[],
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>,
  professionals: any[],
  procedures: any[],
  statuses: any[]
) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { validateFieldValue } = useAppointmentValidation(professionals, procedures, statuses);

  const handleCellClick = (appointmentId: string, field: string, currentValue: string) => {
    console.log(`📝 Starting edit for appointment ${appointmentId}, field ${field}, current value:`, currentValue);
    setEditingCell({ appointmentId, field, value: currentValue });
  };

  const handleCellSave = async () => {
    if (!editingCell || isUpdating) {
      console.log('⚠️ Cannot save: no editing cell or already updating');
      return;
    }

    console.log('💾 Starting save process for:', editingCell);
    setIsUpdating(true);

    try {
      const validation = validateFieldValue(editingCell.field, editingCell.value);
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.error);
        toast({
          title: 'Erro de Validação',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (editingCell.field === 'start_time') {
        const startTime = new Date(editingCell.value);
        const appointment = appointments.find(a => a.id === editingCell.appointmentId);
        if (appointment) {
          const currentEndTime = new Date(appointment.end_time);
          const currentStartTime = new Date(appointment.start_time);
          const duration = currentEndTime.getTime() - currentStartTime.getTime();
          const newEndTime = new Date(startTime.getTime() + duration);
          
          updateData.start_time = startTime.toISOString();
          updateData.end_time = newEndTime.toISOString();
        }
      } else if (editingCell.field === 'professional_id') {
        updateData.professional_id = editingCell.value;
      } else if (editingCell.field === 'procedure_id') {
        updateData.procedure_id = editingCell.value || null;
      } else if (editingCell.field === 'status_id') {
        updateData.status_id = parseInt(editingCell.value);
      } else if (editingCell.field === 'notes') {
        updateData.notes = editingCell.value || null;
      }

      console.log('📤 Sending update to Supabase:', {
        appointmentId: editingCell.appointmentId,
        updateData
      });

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', editingCell.appointmentId)
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color)
        `);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Update successful, updated data:', data);

      if (data && data[0]) {
        setAppointments(prev => prev.map(appointment => 
          appointment.id === editingCell.appointmentId 
            ? { ...appointment, ...data[0] }
            : appointment
        ));
      }

      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso',
      });

      setEditingCell(null);
    } catch (error: any) {
      console.error('❌ Error updating appointment:', error);
      
      let errorMessage = 'Erro ao atualizar agendamento';
      
      if (error.code === '23503') {
        errorMessage = 'Erro de referência: verifique se os dados selecionados existem';
      } else if (error.code === '23505') {
        errorMessage = 'Conflito de dados: já existe um registro similar';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCellCancel = () => {
    console.log('❌ Cancelling edit');
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const handleSelectChange = (field: string, newValue: string) => {
    console.log(`🔄 Select changed for field ${field} to:`, newValue);
    if (editingCell) {
      setEditingCell({ ...editingCell, value: newValue });
    }
  };

  return {
    editingCell,
    setEditingCell,
    isUpdating,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    handleKeyDown,
    handleSelectChange
  };
}

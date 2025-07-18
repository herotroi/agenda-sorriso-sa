import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentFormData, Patient, Professional, Procedure, AppointmentStatus } from '@/types/appointment-form';

export function useAppointmentFormData(
  isOpen: boolean,
  appointmentToEdit: any,
  selectedDate: Date,
  selectedProfessionalId?: string
) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([]);
  const [originalData, setOriginalData] = useState<AppointmentFormData | null>(null);
  const [fieldModified, setFieldModified] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    professional_id: selectedProfessionalId || '',
    procedure_id: '',
    start_time: selectedDate.toISOString().slice(0, 16),
    duration: '60',
    notes: '',
    status_id: 1,
    is_blocked: false
  });

  const handleFieldChange = (field: string, value: any) => {
    setFieldModified(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    if (procedure) {
      setFormData(prev => ({
        ...prev,
        procedure_id: procedureId,
        duration: procedure.default_duration.toString()
      }));
      handleFieldChange('procedure_id', procedureId);
      handleFieldChange('duration', procedure.default_duration.toString());
    }
  };

  const getFinalFormData = () => {
    return formData;
  };

  const resetFieldModifications = () => {
    setFieldModified({});
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      const [patientsRes, professionalsRes, proceduresRes, statusesRes] = await Promise.all([
        supabase.from('patients').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('professionals').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('procedures').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('appointment_statuses').select('*').eq('active', true)
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (proceduresRes.error) throw proceduresRes.error;
      if (statusesRes.error) throw statusesRes.error;

      setPatients(patientsRes.data || []);
      setProfessionals(professionalsRes.data || []);
      setProcedures(proceduresRes.data || []);
      setStatuses(statusesRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do formulário',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (appointmentToEdit) {
      const editData = {
        patient_id: appointmentToEdit.patient_id || '',
        professional_id: appointmentToEdit.professional_id || '',
        procedure_id: appointmentToEdit.procedure_id || '',
        start_time: new Date(appointmentToEdit.start_time).toISOString().slice(0, 16),
        duration: Math.round((new Date(appointmentToEdit.end_time).getTime() - new Date(appointmentToEdit.start_time).getTime()) / (1000 * 60)).toString(),
        notes: appointmentToEdit.notes || '',
        status_id: appointmentToEdit.status_id || 1,
        is_blocked: appointmentToEdit.is_blocked || false
      };
      setFormData(editData);
      setOriginalData(editData);
    } else {
      const newData = {
        patient_id: '',
        professional_id: selectedProfessionalId || '',
        procedure_id: '',
        start_time: selectedDate.toISOString().slice(0, 16),
        duration: '60',
        notes: '',
        status_id: 1,
        is_blocked: false
      };
      setFormData(newData);
      setOriginalData(null);
    }
    setFieldModified({});
  }, [appointmentToEdit, selectedDate, selectedProfessionalId, isOpen]);

  return {
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
  };
}

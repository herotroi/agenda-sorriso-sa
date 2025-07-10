
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export interface FormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  duration: string;
  notes: string;
  status_id: number;
}

export function useAppointmentFormData(
  isOpen: boolean,
  appointmentToEdit: any,
  selectedDate: Date,
  selectedProfessionalId?: string
) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([]);
  
  // Estado principal dos dados do formulário
  const [formData, setFormData] = useState<FormData>({
    patient_id: '',
    professional_id: selectedProfessionalId || '',
    procedure_id: '',
    start_time: '',
    duration: '60',
    notes: '',
    status_id: 1,
  });

  // Estados para armazenar os valores originais (para máscara)
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  
  // Estados para controlar se o campo foi modificado pelo usuário
  const [fieldModified, setFieldModified] = useState<Record<keyof FormData, boolean>>({
    patient_id: false,
    professional_id: false,
    procedure_id: false,
    start_time: false,
    duration: false,
    notes: false,
    status_id: false,
  });

  const fetchData = async () => {
    try {
      const [patientsRes, professionalsRes, proceduresRes, statusesRes] = await Promise.all([
        supabase.from('patients').select('id, full_name').order('full_name'),
        supabase.from('professionals').select('id, name').eq('active', true).order('name'),
        supabase.from('procedures').select('*').eq('active', true).order('name'),
        supabase.from('appointment_statuses').select('id, label, key').eq('active', true).order('id')
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
      console.error('Error fetching data:', error);
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Função para resetar os estados de modificação
  const resetFieldModifications = () => {
    setFieldModified({
      patient_id: false,
      professional_id: false,
      procedure_id: false,
      start_time: false,
      duration: false,
      notes: false,
      status_id: false,
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && appointmentToEdit) {
      // Edit mode - initialize with original data
      const startTime = new Date(appointmentToEdit.start_time);
      const endTime = new Date(appointmentToEdit.end_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      const editFormData = {
        patient_id: appointmentToEdit.patient_id || '',
        professional_id: appointmentToEdit.professional_id || '',
        procedure_id: appointmentToEdit.procedure_id || '',
        start_time: formatDateTimeLocal(startTime),
        duration: duration.toString(),
        notes: appointmentToEdit.notes || '',
        status_id: appointmentToEdit.status_id || 1,
      };
      
      console.log('Setting original appointment data for editing:', editFormData);
      setOriginalData(editFormData);
      setFormData(editFormData);
      resetFieldModifications();
    } else if (isOpen && !appointmentToEdit) {
      // Create mode - reset form with default values
      const defaultTime = selectedDate.toISOString().split('T')[0] + 'T09:00';
      const newFormData = {
        patient_id: '',
        professional_id: selectedProfessionalId || '',
        procedure_id: '',
        start_time: defaultTime,
        duration: '60',
        notes: '',
        status_id: 1,
      };
      
      console.log('Setting default form data for new appointment:', newFormData);
      setFormData(newFormData);
      setOriginalData(null);
      resetFieldModifications();
    }
  }, [isOpen, appointmentToEdit, selectedDate, selectedProfessionalId]);

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    const duration = procedure ? procedure.default_duration.toString() : formData.duration;
    
    console.log('Procedure selection changed:', procedureId);
    setFormData(prev => ({
      ...prev,
      procedure_id: procedureId,
      duration: duration
    }));
    
    // Marcar campos como modificados
    setFieldModified(prev => ({
      ...prev,
      procedure_id: true,
      duration: true
    }));
  };

  // Função para atualizar campos individuais
  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    console.log(`Field ${field} changed to:`, value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Marcar o campo como modificado
    setFieldModified(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Função para obter o valor final do campo (novo se modificado, original se não)
  const getFinalFieldValue = (field: keyof FormData) => {
    if (fieldModified[field] || !originalData) {
      return formData[field];
    }
    return originalData[field];
  };

  // Função para obter dados finais para submissão
  const getFinalFormData = (): FormData => {
    if (!originalData) {
      return formData;
    }

    const finalData: FormData = { ...originalData };
    
    // Aplicar apenas os campos que foram modificados
    Object.keys(fieldModified).forEach((key) => {
      const field = key as keyof FormData;
      if (fieldModified[field]) {
        finalData[field] = formData[field];
      }
    });

    console.log('Final form data for submission:', finalData);
    return finalData;
  };

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
    getFinalFieldValue,
    getFinalFormData,
    resetFieldModifications
  };
}

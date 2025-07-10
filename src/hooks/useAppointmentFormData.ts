
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

  // Estados temporários para edição fluida
  const [tempFormData, setTempFormData] = useState<FormData | null>(null);

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

  // Função para inicializar dados temporários
  const initializeTempData = () => {
    if (appointmentToEdit) {
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
      
      console.log('Initializing temp data for editing:', editFormData);
      setTempFormData(editFormData);
      setFormData(editFormData);
    }
  };

  // Função para resetar dados temporários
  const resetTempData = () => {
    console.log('Resetting temp data');
    setTempFormData(null);
  };

  // Função para atualizar dados temporários
  const updateTempData = (field: keyof FormData, value: string | number) => {
    if (tempFormData) {
      const updatedTempData = { ...tempFormData, [field]: value };
      console.log(`Updating temp data field ${field}:`, value);
      setTempFormData(updatedTempData);
      setFormData(updatedTempData);
    } else {
      const updatedFormData = { ...formData, [field]: value };
      console.log(`Updating form data field ${field}:`, value);
      setFormData(updatedFormData);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && appointmentToEdit) {
      // Edit mode - initialize temp data
      initializeTempData();
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
      
      console.log('Setting default form data:', newFormData);
      setFormData(newFormData);
      setTempFormData(null);
    }
  }, [isOpen, appointmentToEdit, selectedDate, selectedProfessionalId]);

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    const duration = procedure ? procedure.default_duration.toString() : (tempFormData?.duration || formData.duration);
    
    updateTempData('procedure_id', procedureId);
    updateTempData('duration', duration);
  };

  // Função personalizada para atualizar campos
  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    updateTempData(field, value);
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
    tempFormData,
    resetTempData,
    initializeTempData
  };
}

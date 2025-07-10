
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppointmentFormState } from './useAppointmentFormState';
import { Patient, Professional, Procedure, AppointmentStatus, FormData } from '@/types/appointment-form';

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

  const {
    formData,
    setFormData,
    originalData,
    setOriginalData,
    fieldModified,
    setFieldModified,
    resetFieldModifications
  } = useAppointmentFormState(selectedProfessionalId);

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

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    const duration = procedure ? procedure.default_duration.toString() : formData.duration;
    
    console.log('Procedure selection changed:', procedureId);
    setFormData(prev => ({
      ...prev,
      procedure_id: procedureId,
      duration: duration
    }));
    
    setFieldModified(prev => ({
      ...prev,
      procedure_id: true,
      duration: true
    }));
  };

  const handleFieldChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    console.log(`Field ${field} changed to:`, value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setFieldModified(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const getFinalFieldValue = (field: keyof FormData) => {
    if (fieldModified[field] || !originalData) {
      return formData[field];
    }
    return originalData[field];
  };

  const getFinalFormData = (): FormData => {
    if (!originalData) {
      return formData;
    }

    const finalData: FormData = { ...originalData };
    
    (Object.keys(fieldModified) as Array<keyof FormData>).forEach((field) => {
      if (fieldModified[field]) {
        (finalData as any)[field] = formData[field];
      }
    });

    console.log('Final form data for submission:', finalData);
    return finalData;
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && appointmentToEdit) {
      console.log('=== INITIALIZING EDIT FORM ===');
      console.log('Appointment to edit:', appointmentToEdit);
      
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
      
      console.log('Setting edit form data:', editFormData);
      
      // Set both original data and form data to the same values
      setOriginalData(editFormData);
      setFormData(editFormData);
      resetFieldModifications();
    } else if (isOpen && !appointmentToEdit) {
      console.log('=== INITIALIZING NEW FORM ===');
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
  }, [isOpen, appointmentToEdit, selectedDate, selectedProfessionalId, setFormData, setOriginalData, resetFieldModifications]);

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

export type { FormData };

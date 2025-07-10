
import { useState } from 'react';
import { FormData } from '@/types/appointment-form';

export function useAppointmentFormState(selectedProfessionalId?: string) {
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

  return {
    formData,
    setFormData,
    originalData,
    setOriginalData,
    fieldModified,
    setFieldModified,
    resetFieldModifications
  };
}

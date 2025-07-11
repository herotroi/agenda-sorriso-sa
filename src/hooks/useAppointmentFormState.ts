
import { useState } from 'react';
import { AppointmentFormData } from '@/types/appointment-form';

export function useAppointmentFormState(selectedProfessionalId?: string) {
  // Estado principal dos dados do formulário
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    professional_id: selectedProfessionalId || '',
    procedure_id: '',
    start_time: '',
    end_time: '',
    duration: '60',
    notes: '',
    status_id: 1,
    price: 0
  });

  // Estados para armazenar os valores originais (para máscara)
  const [originalData, setOriginalData] = useState<AppointmentFormData | null>(null);
  
  // Estados para controlar se o campo foi modificado pelo usuário
  const [fieldModified, setFieldModified] = useState<Record<keyof AppointmentFormData, boolean>>({
    patient_id: false,
    professional_id: false,
    procedure_id: false,
    start_time: false,
    end_time: false,
    duration: false,
    notes: false,
    status_id: false,
    price: false
  });

  const resetFieldModifications = () => {
    setFieldModified({
      patient_id: false,
      professional_id: false,
      procedure_id: false,
      start_time: false,
      end_time: false,
      duration: false,
      notes: false,
      status_id: false,
      price: false
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

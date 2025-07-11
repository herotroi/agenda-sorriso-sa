
import { useState } from 'react';
import { Patient } from '@/types/patient';

export function usePatientFormState() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const openForm = (patient?: Patient) => {
    setEditingPatient(patient || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    editingPatient,
    openForm,
    closeForm
  };
}

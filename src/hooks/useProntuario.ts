
import { useState, useEffect } from 'react';
import { usePatientsData } from './usePatientsData';
import { useAppointmentsData } from './useAppointmentsData';
import { useDocumentsData } from './useDocumentsData';

export function useProntuario() {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const { patients, fetchPatients } = usePatientsData();
  const { appointments, loading, fetchAppointments } = useAppointmentsData();
  const { documents, fetchDocuments, handleDocumentUpload, handleDocumentDelete } = useDocumentsData();

  const handleDocumentUploadWrapper = async (file: File, description: string) => {
    return handleDocumentUpload(file, description, selectedPatient);
  };

  const handleDocumentDeleteWrapper = async (documentId: string) => {
    return handleDocumentDelete(documentId, selectedPatient);
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
      fetchDocuments(selectedPatient);
    } else {
      setSelectedAppointment(null);
    }
  }, [selectedPatient]);

  // Remove the effect that filters documents by appointment
  // Now documents are always shown for the selected patient

  return {
    patients,
    selectedPatient,
    setSelectedPatient,
    appointments,
    selectedAppointment,
    setSelectedAppointment,
    documents,
    loading,
    handleDocumentUpload: handleDocumentUploadWrapper,
    handleDocumentDelete: handleDocumentDeleteWrapper,
    fetchAppointments,
  };
}

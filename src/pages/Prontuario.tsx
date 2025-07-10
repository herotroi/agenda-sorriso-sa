
import { useState } from 'react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { ProntuarioHeader } from '@/components/PatientRecords/ProntuarioHeader';
import { ProntuarioContent } from '@/components/PatientRecords/ProntuarioContent';
import { useProntuarioData } from '@/hooks/useProntuarioData';

export default function Prontuario() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    appointments,
    selectedAppointment,
    setSelectedAppointment,
    documents,
    loading,
    handleDocumentUpload,
    handleDocumentDelete,
    fetchAppointments,
  } = useProntuarioData();

  const handleFormClose = () => {
    setIsFormOpen(false);
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
    }
  };

  const handleNewAppointment = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProntuarioHeader
        selectedPatient={selectedPatient}
        onNewAppointment={handleNewAppointment}
      />

      {/* Patient Search */}
      <PatientSearch
        patients={patients}
        selectedPatient={selectedPatient}
        onPatientSelect={setSelectedPatient}
      />

      {selectedPatient && (
        <ProntuarioContent
          appointments={appointments}
          selectedAppointment={selectedAppointment}
          onAppointmentSelect={setSelectedAppointment}
          loading={loading}
          documents={documents}
          onDocumentUpload={handleDocumentUpload}
          onDocumentDelete={handleDocumentDelete}
        />
      )}

      <PatientRecordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patientId={selectedPatient}
      />
    </div>
  );
}


import { useState } from 'react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { ProntuarioHeader } from '@/components/PatientRecords/ProntuarioHeader';
import { ProntuarioContent } from '@/components/PatientRecords/ProntuarioContent';
import { useProntuario } from '@/hooks/useProntuario';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradeWarning } from '@/components/Subscription/UpgradeWarning';

export default function Prontuario() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { subscriptionData, loading: subscriptionLoading } = useSubscriptionLimits();
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
  } = useProntuario();

  const handleFormClose = () => {
    setIsFormOpen(false);
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
    }
  };

  const handleNewAppointment = () => {
    setIsFormOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedAppointment(null);
  };

  if (subscriptionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar se o usuário tem acesso ao prontuário eletrônico
  if (subscriptionData && !subscriptionData.hasEHRAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <UpgradeWarning
            title="Prontuário Eletrônico Indisponível"
            description="O prontuário eletrônico não está disponível no plano gratuito. Faça upgrade para ter acesso completo aos registros dos pacientes."
            feature="Prontuário Eletrônico"
          />
        </div>
      </div>
    );
  }

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
          onClearSelection={handleClearSelection}
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

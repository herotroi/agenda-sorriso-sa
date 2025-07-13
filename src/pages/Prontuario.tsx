
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
  const { subscriptionData, loading: subscriptionLoading, checkLimit, showLimitWarning } = useSubscriptionLimits();
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
    if (!checkLimit('ehr')) {
      showLimitWarning('ehr');
      return;
    }
    setIsFormOpen(true);
  };

  const handleDocumentUploadWithCheck = async (file: File, description: string) => {
    if (!checkLimit('ehr')) {
      showLimitWarning('ehr');
      return;
    }
    return handleDocumentUpload(file, description);
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

  const canUseEHR = checkLimit('ehr');

  return (
    <div className="space-y-6">
      <ProntuarioHeader
        selectedPatient={selectedPatient}
        onNewAppointment={handleNewAppointment}
        canCreate={canUseEHR}
      />

      {subscriptionData && (
        <div className={`border rounded-lg p-4 ${canUseEHR ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Plano Atual: {subscriptionData.hasAutomacao ? 'Ilimitado' : subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
              </p>
              <p className="text-sm">
                {canUseEHR ? 
                  'Acesso completo ao prontuário eletrônico' : 
                  'Visualização permitida - Upgrade necessário for criar registros'
                }
              </p>
            </div>
          </div>
        </div>
      )}

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
          onDocumentUpload={handleDocumentUploadWithCheck}
          onDocumentDelete={handleDocumentDelete}
          onClearSelection={handleClearSelection}
          canCreate={canUseEHR}
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

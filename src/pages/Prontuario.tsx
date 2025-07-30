
import { useState } from 'react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { ProntuarioHeader } from '@/components/PatientRecords/ProntuarioHeader';
import { ProntuarioContent } from '@/components/PatientRecords/ProntuarioContent';
import { useProntuario } from '@/hooks/useProntuario';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Users, Calendar } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const canUseEHR = checkLimit('ehr');

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prontuário Eletrônico</h1>
            <p className="text-gray-600">Gerencie consultas e documentos dos pacientes</p>
          </div>
        </div>

        <ProntuarioHeader
          selectedPatient={selectedPatient}
          onNewAppointment={handleNewAppointment}
          canCreate={canUseEHR}
        />
      </div>

      {/* Subscription Status */}
      {subscriptionData && (
        <Card className={`border-l-4 ${canUseEHR ? 'border-l-green-500 bg-green-50' : 'border-l-amber-500 bg-amber-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className={`h-5 w-5 ${canUseEHR ? 'text-green-600' : 'text-amber-600'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      Plano Atual: {subscriptionData.hasAutomacao ? 'Ilimitado' : subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
                    </p>
                    <Badge variant={canUseEHR ? 'default' : 'secondary'} className="text-xs">
                      {canUseEHR ? 'Ativo' : 'Limitado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {canUseEHR ? 
                      'Acesso completo ao prontuário eletrônico' : 
                      'Visualização permitida - Upgrade necessário para criar registros'
                    }
                  </p>
                </div>
              </div>
              {!canUseEHR && (
                <Badge variant="outline" className="bg-white">
                  <Calendar className="h-3 w-3 mr-1" />
                  Somente leitura
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Buscar Paciente</h2>
          </div>
          <PatientSearch
            patients={patients}
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedPatient ? (
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
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Selecione um Paciente</h3>
              <p>Escolha um paciente na busca acima para visualizar seu prontuário</p>
            </div>
          </CardContent>
        </Card>
      )}

      <PatientRecordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patientId={selectedPatient}
      />
    </div>
  );
}


import { useState } from 'react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { ProntuarioHeader } from '@/components/PatientRecords/ProntuarioHeader';
import { ProntuarioContent } from '@/components/PatientRecords/ProntuarioContent';
import { PatientRecordsList } from '@/components/PatientRecords/PatientRecordsList';
import { EditRecordDialog } from '@/components/PatientRecords/EditRecordDialog';
import { useProntuario } from '@/hooks/useProntuario';
import { usePatientRecords } from '@/hooks/usePatientRecords';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Users, Calendar } from 'lucide-react';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
}

export default function Prontuario() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [recordToEditInForm, setRecordToEditInForm] = useState<PatientRecord | null>(null);
  
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

  const { records, loading: recordsLoading, refetchRecords } = usePatientRecords(selectedPatient);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setRecordToEditInForm(null);
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
      refetchRecords();
    }
  };

  const handleNewAppointment = () => {
    if (!checkLimit('ehr')) {
      showLimitWarning('ehr');
      return;
    }
    setRecordToEditInForm(null);
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

  const handleEditRecord = (record: PatientRecord) => {
    // Usar o formulário principal para edição
    setRecordToEditInForm(record);
    setIsFormOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
  };

  const handleRecordUpdated = () => {
    refetchRecords();
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
        {/* Header Section */}
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg w-fit">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  Prontuário Eletrônico
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gerencie consultas e documentos dos pacientes
                </p>
              </div>
            </div>

            <ProntuarioHeader
              selectedPatient={selectedPatient}
              onNewAppointment={handleNewAppointment}
              canCreate={canUseEHR}
            />
          </CardContent>
        </Card>

        {/* Subscription Status */}
        {subscriptionData && (
          <Card className={`border-l-4 ${canUseEHR ? 'border-l-green-500 bg-green-50' : 'border-l-amber-500 bg-amber-50'}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <Shield className={`h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0 ${canUseEHR ? 'text-green-600' : 'text-amber-600'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="font-semibold text-sm sm:text-base">
                        Plano Atual: {subscriptionData.hasAutomacao ? 'Ilimitado' : subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
                      </p>
                      <Badge variant={canUseEHR ? 'default' : 'secondary'} className="text-xs w-fit">
                        {canUseEHR ? 'Ativo' : 'Limitado'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {canUseEHR ? 
                        'Acesso completo ao prontuário eletrônico' : 
                        'Visualização permitida - Upgrade necessário para criar registros'
                      }
                    </p>
                  </div>
                </div>
                {!canUseEHR && (
                  <Badge variant="outline" className="bg-white flex-shrink-0">
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
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column - Patient Records */}
            <div className="order-2 xl:order-1">
              <PatientRecordsList
                records={records}
                onEditRecord={handleEditRecord}
                loading={recordsLoading}
              />
            </div>

            {/* Right Column - Appointments and Documents */}
            <div className="order-1 xl:order-2">
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
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="text-center text-gray-500">
                <FileText className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Selecione um Paciente</h3>
                <p className="text-sm sm:text-base">Escolha um paciente na busca acima para visualizar seu prontuário</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <PatientRecordForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          patientId={selectedPatient}
          recordToEdit={recordToEditInForm}
        />

        <EditRecordDialog
          record={editingRecord}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
          onRecordUpdated={handleRecordUpdated}
        />
      </div>
    </div>
  );
}


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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Users, Calendar, Stethoscope, FolderOpen, ClipboardList } from 'lucide-react';
import { PatientRecord } from '@/types/prontuario';

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
          <div className="space-y-6">
            {/* Três seções principais organizadas em grid responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. Seção de Procedimentos/Agendamentos */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Stethoscope className="h-4 w-4 text-green-600" />
                    </div>
                    <CardTitle className="text-base font-semibold">Procedimentos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div 
                        key={appointment.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                          selectedAppointment === appointment.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedAppointment(appointment.id)}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {appointment.procedures?.name || 'Procedimento não especificado'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Nenhum procedimento encontrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 2. Seção de Documentos */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <FolderOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-base font-semibold">Documentos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {documents.slice(0, 3).map((document) => (
                      <div key={document.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {document.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(document.uploaded_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Nenhum documento encontrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3. Seção de Registros do Prontuário */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    </div>
                    <CardTitle className="text-base font-semibold">Registros</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {records.slice(0, 3).map((record) => (
                      <div 
                        key={record.id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleEditRecord(record)}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {record.title || 'Registro sem título'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Nenhum registro encontrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção detalhada expandida */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Lista completa de registros */}
              <div className="order-2 xl:order-1">
                <PatientRecordsList
                  records={records}
                  onEditRecord={handleEditRecord}
                  loading={recordsLoading}
                />
              </div>

              {/* Procedimentos e documentos detalhados */}
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

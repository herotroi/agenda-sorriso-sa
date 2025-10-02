import { useState, useEffect } from 'react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { SubscriptionFooter } from '@/components/ui/subscription-footer';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { ProntuarioHeader } from '@/components/PatientRecords/ProntuarioHeader';
import { ProntuarioContent } from '@/components/PatientRecords/ProntuarioContent';
import { PatientRecordsList } from '@/components/PatientRecords/PatientRecordsList';
import { EditRecordDialog } from '@/components/PatientRecords/EditRecordDialog';
import { useProntuario } from '@/hooks/useProntuario';
import { usePatientRecords } from '@/hooks/usePatientRecords';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Users, Calendar, Stethoscope, FolderOpen, ClipboardList, ArrowRight } from 'lucide-react';
import { PatientRecord } from '@/types/prontuario';
import { ProceduresOverview } from '@/components/PatientRecords/Overview/ProceduresOverview';
import { DocumentsOverview } from '@/components/PatientRecords/Overview/DocumentsOverview';
import { RecordsOverview } from '@/components/PatientRecords/Overview/RecordsOverview';

export default function Prontuario() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [recordToEditInForm, setRecordToEditInForm] = useState<PatientRecord | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  
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

  useEffect(() => {
    const fetchTotalRecords = async () => {
      if (!user) return;
      
      const { count } = await supabase
        .from('patient_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setTotalRecords(count || 0);
    };

    fetchTotalRecords();
  }, [user]);

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
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
  };

  const handleRecordUpdated = () => {
    refetchRecords();
  };

  const handleRecordDeleted = () => {
    refetchRecords();
    setSelectedPatient(selectedPatient); // Refresh patient data
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
      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl space-y-4 sm:space-y-6 md:space-y-8">
        {/* Main Title */}
        <div className="text-center py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Prontuário Eletrônico
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Sistema completo para gerenciamento de consultas, registros médicos e documentos dos pacientes
          </p>
        </div>

        {/* Patient Search Section */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Buscar Paciente</h2>
            </div>
            <PatientSearch
              patients={patients}
              selectedPatient={selectedPatient}
              onPatientSelect={setSelectedPatient}
            />
          </CardContent>
        </Card>

        {/* Header Section */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <ProntuarioHeader
              selectedPatient={selectedPatient}
              onNewAppointment={handleNewAppointment}
              canCreate={canUseEHR}
            />
          </CardContent>
        </Card>


        {/* Main Content */}
        {selectedPatient && (
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Lista completa de registros */}
              <div className="order-2 lg:order-1">
                <PatientRecordsList
                  records={records}
                  onEditRecord={handleEditRecord}
                  loading={recordsLoading}
                />
              </div>

              {/* Procedimentos e documentos detalhados */}
              <div className="order-1 lg:order-2">
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
          onRecordDeleted={handleRecordDeleted}
        />

        {/* Subscription Footer */}
        {subscriptionData && (
          <SubscriptionFooter
            subscriptionData={subscriptionData}
            currentCount={totalRecords}
            featureName="Registros"
            canUseFeature={canUseEHR}
          />
        )}
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientSearch } from '@/components/PatientRecords/PatientSearch';
import { AppointmentsList } from '@/components/PatientRecords/AppointmentsList';
import { DocumentManager } from '@/components/PatientRecords/DocumentManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price?: number;
  procedures: { name: string } | null;
  professionals: { name: string } | null;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  description?: string;
}

export default function Prontuario() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf, phone, email, active')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAppointments = async (patientId: string) => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          notes,
          price,
          procedures(name),
          professionals(name)
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
      
      // Reset selected appointment when changing patient
      setSelectedAppointment(null);
      setDocuments([]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (appointmentId: string) => {
    // Por enquanto, retorna array vazio
    // Esta funcionalidade será implementada quando o storage for configurado
    setDocuments([]);
  };

  const handleDocumentUpload = async (file: File, description: string) => {
    // Implementação futura para upload de documentos
    console.log('Upload document:', file.name, description);
    toast({
      title: 'Info',
      description: 'Funcionalidade de upload será implementada em breve',
    });
  };

  const handleDocumentDelete = async (documentId: string) => {
    // Implementação futura para exclusão de documentos
    console.log('Delete document:', documentId);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
    } else {
      setAppointments([]);
      setSelectedAppointment(null);
      setDocuments([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchDocuments(selectedAppointment);
    } else {
      setDocuments([]);
    }
  }, [selectedAppointment]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuário Eletrônico</h1>
          <p className="text-gray-600">Gerencie prontuários e documentos dos pacientes</p>
        </div>
        {selectedPatient && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        )}
      </div>

      {/* Patient Search */}
      <PatientSearch
        patients={patients}
        selectedPatient={selectedPatient}
        onPatientSelect={setSelectedPatient}
      />

      {selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Appointments */}
          <AppointmentsList
            appointments={appointments}
            selectedAppointment={selectedAppointment}
            onAppointmentSelect={setSelectedAppointment}
            loading={loading}
          />

          {/* Right Column - Documents */}
          <DocumentManager
            appointmentId={selectedAppointment}
            documents={documents}
            onDocumentUpload={handleDocumentUpload}
            onDocumentDelete={handleDocumentDelete}
          />
        </div>
      )}

      <PatientRecordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patientId={selectedPatient}
      />
    </div>
  );
}

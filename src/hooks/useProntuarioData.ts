
import { useState, useEffect } from 'react';
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

export function useProntuarioData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
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

  return {
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
  };
}

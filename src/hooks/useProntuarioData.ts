
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
  mime_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  description?: string;
  patient_id?: string;
  appointment_id?: string;
  record_id?: string;
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

  const fetchDocuments = async (patientId: string, appointmentId?: string) => {
    try {
      let query = supabase
        .from('prontuario_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match Document interface
      const transformedDocuments = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.mime_type,
        size: doc.file_size,
        url: `${supabase.supabaseUrl}/storage/v1/object/public/documents/${doc.file_path}`,
        uploaded_at: doc.uploaded_at,
        description: doc.description,
        patient_id: doc.patient_id,
        appointment_id: doc.appointment_id,
        record_id: doc.record_id,
        mime_type: doc.mime_type,
        file_size: doc.file_size,
        file_path: doc.file_path
      }));

      setDocuments(transformedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos',
        variant: 'destructive',
      });
    }
  };

  const handleDocumentUpload = async (file: File, description: string) => {
    if (!selectedPatient) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente primeiro',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${selectedPatient}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .insert({
          patient_id: selectedPatient,
          appointment_id: selectedAppointment,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
        });

      if (dbError) throw dbError;

      // Refresh documents list
      if (selectedAppointment) {
        await fetchDocuments(selectedPatient, selectedAppointment);
      } else {
        await fetchDocuments(selectedPatient);
      }

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar documento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      // Get document details first
      const { data: docData, error: fetchError } = await supabase
        .from('prontuario_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      // Refresh documents list
      if (selectedAppointment) {
        await fetchDocuments(selectedPatient, selectedAppointment);
      } else {
        await fetchDocuments(selectedPatient);
      }

      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir documento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
      fetchDocuments(selectedPatient);
    } else {
      setAppointments([]);
      setSelectedAppointment(null);
      setDocuments([]);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (selectedPatient) {
      if (selectedAppointment) {
        fetchDocuments(selectedPatient, selectedAppointment);
      } else {
        fetchDocuments(selectedPatient);
      }
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

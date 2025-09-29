
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment, Patient, ProntuarioDocument } from '@/types/prontuario';

export function useProntuarioData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<ProntuarioDocument[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, cpf, phone, email, active')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pacientes',
        variant: 'destructive',
      });
    }
  };

  const fetchAppointments = async (patientId: string) => {
    if (!patientId || !user) return;
    
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
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
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
    if (!user) return;
    
    try {
      let query = supabase
        .from('prontuario_documents')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match ProntuarioDocument interface
      const transformedDocuments = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.mime_type,
        size: doc.file_size,
        url: `https://qxsaiuojxdnsanyivcxd.supabase.co/storage/v1/object/public/documents/${doc.file_path}`,
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
    if (!selectedPatient || !user) {
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
          appointment_id: selectedAppointment || null,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
          user_id: user.id,
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
    if (!user) return;
    
    try {
      // Get document details first
      const { data: docData, error: fetchError } = await supabase
        .from('prontuario_documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        throw fetchError;
      }

      if (!docData) {
        throw new Error('Documento não encontrado');
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

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
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchAppointments(selectedPatient);
      if (selectedAppointment) {
        fetchDocuments(selectedPatient, selectedAppointment);
      } else {
        fetchDocuments(selectedPatient);
      }
    }
  }, [selectedPatient, selectedAppointment, user]);

  return {
    patients,
    appointments,
    documents,
    selectedPatient,
    selectedAppointment,
    loading,
    setSelectedPatient,
    setSelectedAppointment,
    handleDocumentUpload,
    handleDocumentDelete,
    refetch: () => {
      fetchPatients();
      if (selectedPatient) {
        fetchAppointments(selectedPatient);
        fetchDocuments(selectedPatient, selectedAppointment);
      }
    },
  };
}

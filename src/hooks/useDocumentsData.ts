
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { ProntuarioDocument } from '@/types/prontuario';

export function useDocumentsData() {
  const [documents, setDocuments] = useState<ProntuarioDocument[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = async (patientId: string) => {
    if (!patientId || !user) {
      console.error('Tentativa de buscar documentos sem autenticação ou ID do paciente');
      return;
    }
    
    try {
      // Primeiro verifica se o paciente pertence ao usuário
      const { data: patientCheck } = await supabase
        .from('patients')
        .select('id')
        .eq('id', patientId)
        .eq('user_id', user.id)
        .single();

      if (!patientCheck) {
        console.error('Tentativa de acesso a documentos de paciente não autorizado');
        toast({
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar documentos deste paciente',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('prontuario_documents')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

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

  const handleDocumentUpload = async (
    file: File, 
    description: string,
    selectedPatient: string
  ) => {
    if (!selectedPatient || !user) {
      console.error('Tentativa de upload sem autenticação ou ID do paciente');
      toast({
        title: 'Erro',
        description: 'Selecione um paciente primeiro',
        variant: 'destructive',
      });
      return;
    }

    // Verifica se o paciente pertence ao usuário
    const { data: patientCheck } = await supabase
      .from('patients')
      .select('id')
      .eq('id', selectedPatient)
      .eq('user_id', user.id)
      .single();

    if (!patientCheck) {
      console.error('Tentativa de upload de documento para paciente não autorizado');
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para fazer upload de documentos para este paciente',
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

      // Save document metadata to database (without appointment_id)
      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .insert({
          patient_id: selectedPatient,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
          user_id: user.id,
        });

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments(selectedPatient);

      toast({
        title: 'Sucesso',
        description: 'Documento do cliente enviado com sucesso',
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

  const handleDocumentDelete = async (
    documentId: string,
    selectedPatient: string
  ) => {
    if (!documentId || !user) {
      console.error('Tentativa de deletar documento sem autenticação');
      return;
    }
    
    try {
      // Get document details first and verify ownership
      const { data: docData, error: fetchError } = await supabase
        .from('prontuario_documents')
        .select('file_path, user_id')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        throw fetchError;
      }

      if (!docData) {
        console.error('Tentativa de deletar documento não autorizado');
        toast({
          title: 'Acesso Negado',
          description: 'Você não tem permissão para deletar este documento',
          variant: 'destructive',
        });
        return;
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
      await fetchDocuments(selectedPatient);

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

  return {
    documents,
    fetchDocuments,
    handleDocumentUpload,
    handleDocumentDelete,
  };
}

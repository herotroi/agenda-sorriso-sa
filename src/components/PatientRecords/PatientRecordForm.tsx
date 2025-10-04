import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, X, Calendar, User, Clock, DollarSign, Stethoscope, Pill, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ICDSearchInput } from './ICDSearchInput';

interface PatientRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  recordToEdit?: {
    id: string;
    title?: string;
    content?: string;
    prescription?: string;
    professional_id?: string;
  } | null;
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

interface Professional {
  id: string;
  name: string;
  specialty?: string;
}

interface FileUpload {
  file: File;
  description: string;
  preview?: string;
}

interface ExistingDocument {
  id: string;
  name: string;
  description?: string;
  file_size: number;
  mime_type: string;
  file_path: string;
}

export function PatientRecordForm({ isOpen, onClose, patientId, recordToEdit }: PatientRecordFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prescription, setPrescription] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [fetchingProfessionals, setFetchingProfessionals] = useState(false);
  const [icdCode, setIcdCode] = useState('');
  const [icdVersion, setIcdVersion] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAppointments = async () => {
    if (!user?.id || !patientId) return;

    console.log('Fetching appointments for patient:', patientId);
    setFetchingAppointments(true);

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

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Fetched appointments:', data?.length || 0);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setFetchingAppointments(false);
    }
  };

  const fetchProfessionals = async () => {
    if (!user?.id) return;

    setFetchingProfessionals(true);
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar profissionais',
        variant: 'destructive',
      });
    } finally {
      setFetchingProfessionals(false);
    }
  };

  const fetchLinkedAppointments = async (recordId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('record_appointments')
        .select('appointment_id')
        .eq('record_id', recordId);

      if (error) {
        console.error('Error fetching linked appointments:', error);
        return;
      }

      const appointmentIds = data?.map(item => item.appointment_id) || [];
      console.log('Linked appointments found:', appointmentIds);
      setSelectedAppointments(appointmentIds);
    } catch (error) {
      console.error('Error loading linked appointments:', error);
    }
  };

  const fetchExistingDocuments = async (recordId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('prontuario_documents')
        .select('id, name, description, file_size, mime_type, file_path')
        .eq('record_id', recordId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching existing documents:', error);
        return;
      }

      console.log('Existing documents found:', data?.length || 0);
      setExistingDocuments(data || []);
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  };

  useEffect(() => {
    if (isOpen && patientId && user?.id) {
      fetchAppointments();
      fetchProfessionals();
    }
  }, [isOpen, patientId, user?.id]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setPrescription('');
      setSelectedProfessional('');
      setSelectedAppointments([]);
      setFiles([]);
      setExistingDocuments([]);
      setDocumentsToDelete([]);
      setAppointments([]);
      setProfessionals([]);
      setIcdCode('');
      setIcdVersion('');
    } else if (recordToEdit) {
      // Preencher campos para edição
      setTitle(recordToEdit.title || '');
      setContent(recordToEdit.content || '');
      setPrescription(recordToEdit.prescription || '');
      setIcdCode((recordToEdit as any).icd_code || '');
      setIcdVersion((recordToEdit as any).icd_version || '');
      // Carregar profissional se o registro tiver um professional_id
      if ('professional_id' in recordToEdit && recordToEdit.professional_id) {
        setSelectedProfessional(String(recordToEdit.professional_id));
      } else {
        setSelectedProfessional('');
      }
      
      // Buscar agendamentos vinculados e documentos existentes se estiver editando
      if (recordToEdit.id) {
        fetchLinkedAppointments(recordToEdit.id);
        fetchExistingDocuments(recordToEdit.id);
      }
    } else {
      // Limpar campos para novo registro
      setTitle('');
      setContent('');
      setPrescription('');
      setSelectedProfessional('');
      setSelectedAppointments([]);
      setExistingDocuments([]);
      setDocumentsToDelete([]);
      setIcdCode('');
      setIcdVersion('');
    }
  }, [isOpen, recordToEdit]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: `Arquivo ${file.name} é muito grande. Máximo 10MB.`,
          variant: 'destructive',
        });
        return;
      }

      const newFile: FileUpload = {
        file,
        description: '',
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFiles(prev => prev.map(f => 
            f.file.name === file.name ? { ...f, preview: result } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [...prev, newFile]);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileDescription = (index: number, description: string) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, description } : f
    ));
  };

  const removeExistingDocument = (documentId: string) => {
    setDocumentsToDelete(prev => [...prev, documentId]);
    setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const updateExistingDocumentDescription = (documentId: string, description: string) => {
    setExistingDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, description } : doc
    ));
  };

  const downloadDocument = async (doc: ExistingDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao baixar documento',
        variant: 'destructive',
      });
    }
  };

  const handleAppointmentToggle = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const uploadFile = async (fileUpload: FileUpload, recordId: string) => {
    const { file, description } = fileUpload;
    
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${recordId}/${timestamp}.${fileExtension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .insert({
          name: file.name,
          description: description || null,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          record_id: recordId,
          user_id: user?.id,
          uploaded_by: user?.id,
        });

      if (dbError) throw dbError;

      console.log('File uploaded successfully:', fileName);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const updateExistingDocuments = async () => {
    try {
      // Deletar documentos marcados para exclusão
      for (const documentId of documentsToDelete) {
        // Buscar o documento para obter o file_path
        const { data: docData, error: fetchError } = await supabase
          .from('prontuario_documents')
          .select('file_path')
          .eq('id', documentId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching document for deletion:', fetchError);
          continue;
        }
        
        if (!docData) {
          console.error('Document not found for deletion:', documentId);
          continue;
        }

        // Deletar do storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([docData.file_path]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }

        // Deletar do banco
        const { error: dbError } = await supabase
          .from('prontuario_documents')
          .delete()
          .eq('id', documentId);

        if (dbError) {
          console.error('Error deleting from database:', dbError);
        }
      }

      // Atualizar descrições dos documentos existentes
      for (const document of existingDocuments) {
        const { error } = await supabase
          .from('prontuario_documents')
          .update({ description: document.description || null })
          .eq('id', document.id);

        if (error) {
          console.error('Error updating document description:', error);
        }
      }
    } catch (error) {
      console.error('Error updating existing documents:', error);
      throw error;
    }
  };

  const updateAppointmentAssociations = async (recordId: string, newAppointmentIds: string[]) => {
    try {
      // Primeiro, remove todas as associações existentes
      const { error: deleteError } = await supabase
        .from('record_appointments')
        .delete()
        .eq('record_id', recordId);

      if (deleteError) {
        console.error('Error deleting existing associations:', deleteError);
        throw deleteError;
      }

      // Depois, adiciona as novas associações
      if (newAppointmentIds.length > 0) {
        const appointmentAssociations = newAppointmentIds.map(appointmentId => ({
          record_id: recordId,
          appointment_id: appointmentId,
        }));

        const { error: insertError } = await supabase
          .from('record_appointments')
          .insert(appointmentAssociations);

        if (insertError) {
          console.error('Error inserting new associations:', insertError);
          throw insertError;
        }
      }

      console.log('Appointment associations updated successfully');
    } catch (error) {
      console.error('Error updating appointment associations:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    if (!patientId) {
      toast({
        title: 'Erro',
        description: 'Paciente não selecionado',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProfessional) {
      toast({
        title: 'Erro',
        description: 'Profissional responsável é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAppointments.length === 0) {
      toast({
        title: 'Erro',
        description: 'Pelo menos um agendamento deve ser selecionado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const recordData = {
        title: title.trim(),
        content: content.trim() || null,
        notes: content.trim() || null,
        prescription: prescription.trim() || null,
        patient_id: patientId,
        professional_id: selectedProfessional || null,
        user_id: user.id,
        created_by: user.id,
        icd_code: icdCode || null,
        icd_version: icdVersion || null,
      };

      let record;

      if (recordToEdit?.id) {
        // Atualizar registro existente
        const { data, error: recordError } = await supabase
          .from('patient_records')
          .update({
            ...recordData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recordToEdit.id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();

        if (recordError) {
          console.error('Error updating record:', recordError);
          throw recordError;
        }
        
        if (!data) {
          throw new Error('Registro não encontrado para atualização');
        }
        
        record = data;

        // Atualizar associações de agendamentos
        await updateAppointmentAssociations(recordToEdit.id, selectedAppointments);

        // Atualizar documentos existentes (deletar marcados e atualizar descrições)
        await updateExistingDocuments();

        toast({
          title: 'Sucesso',
          description: 'Prontuário atualizado com sucesso',
        });
      } else {
        // Criar novo registro
        const { data, error: recordError } = await supabase
          .from('patient_records')
          .insert(recordData)
          .select()
          .maybeSingle();

        if (recordError) {
          console.error('Error creating record:', recordError);
          throw recordError;
        }
        
        if (!data) {
          throw new Error('Falha ao criar registro');
        }
        
        record = data;

        // Adicionar associações de agendamentos
        if (selectedAppointments.length > 0) {
          const appointmentAssociations = selectedAppointments.map(appointmentId => ({
            record_id: record.id,
            appointment_id: appointmentId,
          }));

          const { error: associationError } = await supabase
            .from('record_appointments')
            .insert(appointmentAssociations);

          if (associationError) {
            console.error('Error associating appointments:', associationError);
          }
        }

        toast({
          title: 'Sucesso',
          description: 'Prontuário criado com sucesso',
        });
      }

      // Upload de novos arquivos
      if (files.length > 0) {
        const uploadPromises = files.map(fileUpload => uploadFile(fileUpload, record.id));
        
        try {
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Error uploading some files:', uploadError);
          toast({
            title: 'Aviso',
            description: 'Prontuário salvo, mas alguns arquivos não puderam ser enviados',
            variant: 'default',
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving patient record:', error);
      toast({
        title: 'Erro',
        description: recordToEdit?.id ? 'Erro ao atualizar prontuário' : 'Erro ao criar prontuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {recordToEdit?.id ? 'Editar Prontuário' : 'Novo Prontuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Prontuário *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Consulta de retorno, Primeira consulta, etc."
                  required
                />
              </div>

              <ICDSearchInput
                onSelect={(code, version) => {
                  setIcdCode(code);
                  setIcdVersion(version);
                }}
                initialCode={icdCode}
                initialVersion={icdVersion}
              />

              <div>
                <Label htmlFor="content">Anotações da Consulta</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Descreva os detalhes da consulta, observações importantes, sintomas relatados, exame físico, diagnóstico, tratamento recomendado, orientações..."
                />
              </div>

              <div>
                <Label htmlFor="prescription" className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-green-600" />
                  Receita/Prescrição Médica
                </Label>
                <RichTextEditor
                  content={prescription}
                  onChange={setPrescription}
                  placeholder="Liste os medicamentos prescritos, dosagens, frequência, duração do tratamento, instruções especiais..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Medicamentos, dosagens e instruções de uso (campo opcional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Selection */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profissional Responsável *
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fetchingProfessionals ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Carregando profissionais...</span>
                </div>
              ) : (
                <div>
                  <Label htmlFor="professional">Selecionar Profissional *</Label>
                  <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                    <SelectTrigger className={`w-full ${!selectedProfessional ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Escolha um profissional" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {professionals.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum profissional cadastrado
                        </SelectItem>
                      ) : (
                        professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            <div>
                              <div className="font-medium">{professional.name}</div>
                              {professional.specialty && (
                                <div className="text-sm text-gray-500">{professional.specialty}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Profissional que realizou ou é responsável por este atendimento <span className="text-red-500">*</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Selection */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Agendamentos Relacionados *
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fetchingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Carregando agendamentos...</span>
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-gray-500 py-4">Nenhum agendamento encontrado para este paciente. <span className="text-red-500">É necessário ter pelo menos um agendamento para criar um prontuário.</span></p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedAppointments.length === 0 && (
                    <p className="text-red-500 text-sm mb-2">* Selecione pelo menos um agendamento</p>
                  )}
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        selectedAppointments.includes(appointment.id)
                          ? 'border-green-300 bg-green-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedAppointments.includes(appointment.id)}
                        onCheckedChange={() => handleAppointmentToggle(appointment.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(appointment.start_time).toLocaleString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(appointment.end_time).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {appointment.professionals && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Profissional:</span>
                              <span>{appointment.professionals.name}</span>
                            </div>
                          )}
                          
                          {appointment.procedures && (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Procedimento:</span>
                              <span>{appointment.procedures.name}</span>
                            </div>
                          )}
                        </div>

                        {appointment.price && (
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Valor:</span>
                            <span>R$ {appointment.price.toFixed(2)}</span>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Observações:</span>
                            <p className="text-gray-600 mt-1">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload and Management */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Documentos e Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Documentos existentes (apenas na edição) */}
              {recordToEdit?.id && existingDocuments.length > 0 && (
                <div>
                  <Label>Documentos Existentes</Label>
                  <div className="space-y-3 mt-2">
                    {existingDocuments.map((document) => (
                      <div key={document.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{document.name}</p>
                          <p className="text-xs text-gray-500">
                            {(document.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          
                          <Input
                            value={document.description || ''}
                            onChange={(e) => updateExistingDocumentDescription(document.id, e.target.value)}
                            placeholder="Descrição do arquivo (opcional)"
                            className="mt-2 h-8 text-xs"
                          />
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadDocument(document)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingDocument(document.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de novos arquivos */}
              <div>
                <Label htmlFor="files">Adicionar Novos Arquivos</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, TXT. Máximo 10MB por arquivo.
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((fileUpload, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                      {fileUpload.preview && (
                        <img
                          src={fileUpload.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{fileUpload.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        
                        <Input
                          value={fileUpload.description}
                          onChange={(e) => updateFileDescription(index, e.target.value)}
                          placeholder="Descrição do arquivo (opcional)"
                          className="mt-2 h-8 text-xs"
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {recordToEdit?.id ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                recordToEdit?.id ? 'Atualizar Prontuário' : 'Criar Prontuário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

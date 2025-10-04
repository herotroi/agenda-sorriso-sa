import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Stethoscope, Pill, Calendar, User, Upload, X, Download, Eye, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditableRichTextEditor } from './EditableRichTextEditor';
import { ICDMultiSelect } from './ICDMultiSelect';
import { ICDCode } from '@/types/prontuario';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  appointment_id?: string;
  professional_id?: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

interface Professional {
  id: string;
  name: string;
  specialty?: string;
}

interface EditRecordDialogProps {
  record: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdated: () => void;
  onRecordDeleted?: () => void;
}

interface Document {
  id: string;
  name: string;
  description?: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  uploaded_at: string;
}

interface FileUpload {
  file: File;
  description: string;
  preview?: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  procedures: { name: string } | null;
  professionals: { name: string } | null;
  patients: { full_name: string } | null;
}

export function EditRecordDialog({ record, isOpen, onClose, onRecordUpdated, onRecordDeleted }: EditRecordDialogProps) {
  const [recordData, setRecordData] = useState<PatientRecord | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prescription: '',
    appointment_id: '',
    professional_id: '',
  });
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [selectedIcds, setSelectedIcds] = useState<ICDCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const requestIdRef = React.useRef(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const fetchRecordDetails = async (recordId: string, currentRequestId: number) => {
    if (!user?.id) return;
    
    console.log('🔍 Fetching record details for ID:', recordId, 'requestId:', currentRequestId);
    
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select('id, title, content, notes, prescription, appointment_id, professional_id, created_at, updated_at, icd_codes, icd_code, icd_version')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching record:', error);
        throw error;
      }
      
      // Check if this request is still valid
      if (requestIdRef.current !== currentRequestId) {
        console.log('⚠️ Request outdated, ignoring results');
        return;
      }
      
      if (!data) {
        console.warn('⚠️ No record found for ID:', recordId);
        toast({
          title: 'Erro',
          description: 'Registro não encontrado',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Record loaded successfully:', {
        id: data.id,
        title: data.title,
        contentLength: data.content?.length || 0,
        prescriptionLength: data.prescription?.length || 0,
        appointment_id: data.appointment_id,
        professional_id: data.professional_id
      });

      // Set record data first
      setRecordData(data);
      
      // Then populate form data
      const newFormData = {
        title: data.title || '',
        content: (data.content || data.notes) || '',
        prescription: data.prescription || '',
        appointment_id: data.appointment_id || 'none',
        professional_id: data.professional_id || '',
      };

      console.log('📝 Setting form data:', {
        titleLength: newFormData.title.length,
        contentLength: newFormData.content.length,
        prescriptionLength: newFormData.prescription.length,
        appointment_id: newFormData.appointment_id,
        professional_id: newFormData.professional_id
      });
      
      setFormData(newFormData);
      setDataLoaded(true);
      
      // Carregar ICD codes após marcar como loaded
      const recordWithIcds = data as any;
      if (recordWithIcds.icd_codes) {
        try {
          const parsedIcds = typeof recordWithIcds.icd_codes === 'string' 
            ? JSON.parse(recordWithIcds.icd_codes) 
            : recordWithIcds.icd_codes;
          setSelectedIcds(Array.isArray(parsedIcds) ? parsedIcds : []);
        } catch (e) {
          console.error('Error parsing icd_codes:', e);
          setSelectedIcds([]);
        }
      } else if (recordWithIcds.icd_code && recordWithIcds.icd_version) {
        // Migrar dado legado
        setSelectedIcds([{
          code: recordWithIcds.icd_code,
          version: recordWithIcds.icd_version,
          title: `${recordWithIcds.icd_code} - ${recordWithIcds.icd_version}`
        }]);
      } else {
        setSelectedIcds([]);
      }
      
      console.log('✅ Data marked as loaded');
      
    } catch (err) {
      console.error('❌ Error in fetchRecordDetails:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do registro',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      console.log('🔄 Dialog closed, resetting state');
      setRecordData(null);
      setDataLoaded(false);
      setFormData({
        title: '',
        content: '',
        prescription: '',
        appointment_id: 'none',
        professional_id: '',
      });
      setDocuments([]);
      setFiles([]);
      setAppointments([]);
      setProfessionals([]);
      setSelectedAppointments([]);
      setSelectedIcds([]);
      return;
    }
    
    if (!record?.id || !user?.id) return;
    
    console.log('🔄 EditRecordDialog useEffect triggered, record:', record.id, 'isOpen:', isOpen);
    
    // Increment request ID to invalidate previous requests
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    
    // Reset states
    setRecordData(null);
    setDataLoaded(false);
    setLoading(true);
    setFormData({
      title: '',
      content: '',
      prescription: '',
      appointment_id: 'none',
      professional_id: '',
    });
    
    console.log('🚀 Starting data fetch with requestId:', currentRequestId);
    
    // Fetch all data in parallel
    const loadAllData = async () => {
      try {
        await Promise.all([
          fetchRecordDetails(record.id, currentRequestId),
          fetchAppointments(),
          fetchProfessionals(),
          fetchDocuments(),
          fetchLinkedAppointments()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [record?.id, isOpen, user?.id]);

  const fetchLinkedAppointments = async () => {
    if (!record?.id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('record_appointments')
        .select('appointment_id')
        .eq('record_id', record.id);

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

  const fetchAppointments = async () => {
    if (!record?.id || !user?.id) return;
    
    setLoadingAppointments(true);
    try {
      // Buscar primeiro o patient_id do registro
      const { data: recordData, error: recordError } = await supabase
        .from('patient_records')
        .select('patient_id')
        .eq('id', record.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (recordError) {
        console.error('Error fetching record data:', recordError);
        throw recordError;
      }
      
      if (!recordData) {
        toast({
          title: 'Erro',
          description: 'Registro não encontrado',
          variant: 'destructive',
        });
        return;
      }

      // Buscar agendamentos do paciente
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          procedures(name),
          professionals(name),
          patients(full_name)
        `)
        .eq('patient_id', recordData.patient_id)
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
      setLoadingAppointments(false);
    }
  };

  const handleAppointmentToggle = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const fetchProfessionals = async () => {
    if (!user?.id) return;
    
    setLoadingProfessionals(true);
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
      setLoadingProfessionals(false);
    }
  };

  const fetchDocuments = async () => {
    if (!record?.id || !user?.id) return;
    
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('prontuario_documents')
        .select('*')
        .eq('record_id', record.id)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos',
        variant: 'destructive',
      });
    } finally {
      setLoadingDocs(false);
    }
  };


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
    
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileDescription = (index: number, description: string) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, description } : f
    ));
  };

  const uploadFile = async (fileUpload: FileUpload) => {
    if (!record?.id || !user?.id) return;

    const { file, description } = fileUpload;
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${record.id}/${timestamp}.${fileExtension}`;

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
          record_id: record.id,
          user_id: user.id,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (!user?.id) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('prontuario_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso',
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir documento',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = (filePath: string) => {
    const url = `https://qxsaiuojxdnsanyivcxd.supabase.co/storage/v1/object/public/documents/${filePath}`;
    window.open(url, '_blank');
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
    
    if (!record || !user) {
      toast({
        title: 'Erro',
        description: 'Dados inválidos para atualização',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('💾 Starting save process with data:', {
        title: formData.title,
        contentLength: formData.content?.length || 0,
        contentHasTables: formData.content?.includes('<table>') || false,
        prescriptionLength: formData.prescription?.length || 0,
        prescriptionHasTables: formData.prescription?.includes('<table>') || false,
        appointment_id: formData.appointment_id,
        professional_id: formData.professional_id,
        selectedAppointments: selectedAppointments
      });

      const updateData = {
        title: formData.title.trim(),
        content: formData.content?.trim() || null,
        notes: formData.content?.trim() || null,
        prescription: formData.prescription?.trim() || null,
        appointment_id: selectedAppointments.length > 0 ? selectedAppointments[0] : null,
        professional_id: formData.professional_id || null,
        icd_codes: selectedIcds.length > 0 ? JSON.stringify(selectedIcds) : null,
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Saving to database with tables:', {
        contentHasTables: updateData.content?.includes('<table>') || false,
        prescriptionHasTables: updateData.prescription?.includes('<table>') || false
      });

      const { error } = await supabase
        .from('patient_records')
        .update(updateData)
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Database save error:', error);
        throw error;
      }

      console.log('✅ Record saved successfully to database');

      // Atualizar associações de agendamentos
      await updateAppointmentAssociations(record.id, selectedAppointments);

      // Verify the save worked by checking the database
      const { data: verifyData } = await supabase
        .from('patient_records')
        .select('content, prescription')
        .eq('id', record.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (verifyData) {
        console.log('🔍 Verification - Tables saved correctly:', {
          contentHasTables: verifyData.content?.includes('<table>') || false,
          prescriptionHasTables: verifyData.prescription?.includes('<table>') || false
        });
      }

      // Handle file uploads
      if (files.length > 0) {
        console.log('📄 Processing file uploads:', files.length);
        const uploadPromises = files.map(fileUpload => uploadFile(fileUpload));
        
        try {
          await Promise.all(uploadPromises);
          console.log('✅ All files uploaded successfully');
        } catch (uploadError) {
          console.error('❌ Error uploading some files:', uploadError);
          toast({
            title: 'Aviso',
            description: 'Registro atualizado, mas alguns arquivos não puderam ser enviados',
            variant: 'default',
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Registro e agendamentos atualizados com sucesso!',
      });

      // Refresh data
      onRecordUpdated();
      fetchDocuments();
      setFiles([]);
      
      // Verify the save worked by fetching the data again
      setTimeout(() => {
        requestIdRef.current += 1;
        fetchRecordDetails(record.id, requestIdRef.current);
        fetchLinkedAppointments();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error updating record:', error);
      toast({
        title: 'Erro',
        description: `Erro ao atualizar registro: ${error.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!record || !user) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    setLoading(true);
    try {
      // Primeiro, excluir todos os documentos relacionados
      const { data: docsToDelete } = await supabase
        .from('prontuario_documents')
        .select('file_path')
        .eq('record_id', record.id);

      if (docsToDelete && docsToDelete.length > 0) {
        // Excluir arquivos do storage
        const filePaths = docsToDelete.map(doc => doc.file_path);
        await supabase.storage
          .from('documents')
          .remove(filePaths);
      }

      // Excluir registros de documentos
      await supabase
        .from('prontuario_documents')
        .delete()
        .eq('record_id', record.id);

      // Excluir vínculos com agendamentos
      await supabase
        .from('record_appointments')
        .delete()
        .eq('record_id', record.id);

      // Excluir o prontuário
      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Prontuário excluído com sucesso.',
      });

      onRecordDeleted?.();
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir o prontuário. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogDescription className="sr-only">Editar registro do prontuário</DialogDescription>
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Editar Registro do Prontuário</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Última atualização: {format(new Date(record.updated_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Record Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
              
              {record.professionals && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Profissional:</span>
                  <span className="font-medium">Dr(a). {record.professionals.name}</span>
                </div>
              )}
              
              {record.appointments?.procedures && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Stethoscope className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Procedimento:</span>
                  <span className="font-medium">{record.appointments.procedures.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Título da Consulta *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Consulta de retorno, Primeira consulta, etc."
              className="h-12"
              required
            />
          </div>

          {/* CID Codes */}
          <div className="space-y-2">
            <ICDMultiSelect
              selectedCodes={selectedIcds}
              onCodesChange={setSelectedIcds}
              maxCodes={10}
            />
          </div>

          {/* Profissional Responsável */}
          <div className="space-y-2">
            <Label htmlFor="professional" className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Profissional Responsável
            </Label>
            <Select 
              value={formData.professional_id} 
              onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
              disabled={loadingProfessionals}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={loadingProfessionals ? "Carregando profissionais..." : "Selecione o profissional responsável"} />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    Dr(a). {professional.name} {professional.specialty && `- ${professional.specialty}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Selecione o profissional responsável por este registro
            </p>
          </div>

          {/* Anotações da Consulta */}
          {!dataLoaded ? (
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Anotações da Consulta
              </Label>
              <div className="border border-input rounded-lg p-8 bg-gray-50">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-600">Carregando dados do prontuário...</p>
                </div>
              </div>
            </div>
          ) : (
            <EditableRichTextEditor
              key={`content-${record?.id}`}
              label="Anotações da Consulta"
              content={formData.content || ''}
              onChange={(content) => {
                console.log('📝 Content updated via EditableRichTextEditor, length:', content.length);
                setFormData(prev => ({ ...prev, content }));
              }}
              onSave={() => handleSubmit(new Event('submit') as any)}
              placeholder="Descreva as observações da consulta, sintomas relatados, exame físico, diagnóstico, tratamento recomendado, orientações..."
              icon={<Stethoscope className="h-4 w-4" />}
              loading={loading}
            />
          )}

          {/* Receita/Prescrição */}
          {!dataLoaded ? (
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Receita/Prescrição Médica
              </Label>
              <div className="border border-input rounded-lg p-8 bg-gray-50">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-600">Carregando dados da prescrição...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <EditableRichTextEditor
                key={`prescription-${record?.id}`}
                label="Receita/Prescrição Médica"
                content={formData.prescription || ''}
                onChange={(prescription) => {
                  console.log('💊 Prescription updated via EditableRichTextEditor, length:', prescription.length);
                  setFormData(prev => ({ ...prev, prescription }));
                }}
                onSave={() => handleSubmit(new Event('submit') as any)}
                placeholder="Liste os medicamentos prescritos, dosagens, frequência, duração do tratamento, instruções especiais..."
                icon={<Pill className="h-4 w-4" />}
                loading={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Medicamentos, dosagens e instruções de uso (campo opcional)
              </p>
            </>
          )}

          <Separator />

          {/* Agendamentos Vinculados */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Agendamentos Vinculados</h3>
              </div>
              
              {loadingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Carregando agendamentos...</span>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                        selectedAppointments.includes(appointment.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleAppointmentToggle(appointment.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedAppointments.includes(appointment.id)}
                          onCheckedChange={() => handleAppointmentToggle(appointment.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {format(new Date(appointment.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-600">
                                {format(new Date(appointment.start_time), 'HH:mm', { locale: ptBR })} - {format(new Date(appointment.end_time), 'HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            
                            {appointment.procedures && (
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">{appointment.procedures.name}</span>
                              </div>
                            )}
                            
                            {appointment.professionals && (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">Dr(a). {appointment.professionals.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  Nenhum agendamento encontrado para este paciente.
                </p>
              )}
              
              {selectedAppointments.length > 0 && (
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    {selectedAppointments.length} agendamento{selectedAppointments.length > 1 ? 's' : ''} selecionado{selectedAppointments.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Documents Section */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Documentos e Arquivos</h3>
              </div>

              {/* Existing Documents */}
              {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Carregando documentos...</span>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Documentos Existentes:</h4>
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc.file_path)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum documento anexado ainda.</p>
              )}

              <Separator />

              {/* Add New Files */}
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
                  <h4 className="font-medium text-gray-700">Novos Arquivos:</h4>
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
          <Separator />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteRecord}
              disabled={loading}
              className="sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Prontuário
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.title.trim()}
                className="sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Processando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

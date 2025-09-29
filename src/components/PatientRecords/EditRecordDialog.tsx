import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Stethoscope, Pill, Calendar, User, Upload, X, Download, Eye, Printer, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditableRichTextEditor } from './EditableRichTextEditor';

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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prescription: '',
    appointment_id: '',
    professional_id: '',
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if initial data is loaded
  const { toast } = useToast();
  const { user } = useAuth();

  // Garantir que carregamos os dados mais recentes diretamente do banco
  const fetchRecordDetails = async (recordId: string, retryCount = 0) => {
    if (!user?.id) return;
    
    console.log('🔍 Fetching record details for ID:', recordId, 'attempt:', retryCount + 1);
    setLoading(true);
    setDataLoaded(false); // Mark data as not loaded while fetching
    
    try {
      // Wait a bit to avoid race conditions
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const { data, error } = await supabase
        .from('patient_records')
        .select('id, title, content, notes, prescription, appointment_id, professional_id')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching record:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('⚠️ No record found for ID:', recordId);
        
        // Retry up to 3 times
        if (retryCount < 3) {
          console.log('🔄 Retrying fetchRecordDetails...');
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchRecordDetails(recordId, retryCount + 1);
        }
        
        toast({
          title: 'Erro',
          description: 'Registro não encontrado após múltiplas tentativas',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      console.log('✅ Record loaded successfully:', {
        title: data.title,
        contentLength: data.content?.length || 0,
        prescriptionLength: data.prescription?.length || 0,
        appointment_id: data.appointment_id,
        professional_id: data.professional_id
      });

      const newFormData = {
        title: data.title || '',
        content: (data.content || data.notes) || '',
        prescription: data.prescription || '',
        appointment_id: data.appointment_id || 'none',
        professional_id: data.professional_id || '',
      };

      console.log('📝 Setting form data with content length:', newFormData.content.length);
      
      // Set form data first
      setFormData(newFormData);
      
      // Wait for state to settle, then mark as loaded
      await new Promise(resolve => setTimeout(resolve, 300));
      setDataLoaded(true);
      console.log('✅ Data marked as loaded, editors can now render');
      
    } catch (err) {
      console.error('❌ Error in fetchRecordDetails:', err);
      
      // Retry on error up to 3 times
      if (retryCount < 3) {
        console.log('🔄 Retrying after error...');
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return fetchRecordDetails(recordId, retryCount + 1);
      }
      
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do registro após múltiplas tentativas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 EditRecordDialog useEffect triggered, record:', record?.id, 'isOpen:', isOpen);
    
    if (record && isOpen) {
      // Reset states
      setDataLoaded(false);
      setFormData({
        title: '',
        content: '',
        prescription: '',
        appointment_id: 'none',
        professional_id: '',
      });
      
      // Fetch all data in sequence to ensure proper loading
      const loadAllData = async () => {
        await fetchRecordDetails(record.id);
        // Only fetch other data after record details are loaded
        fetchDocuments();
        fetchAppointments();
        fetchProfessionals();
      };
      
      loadAllData();
    } else if (!record) {
      console.log('🔄 Clearing form data - no record');
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
    }
  }, [record, isOpen]);

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

  const handlePrint = async () => {
    if (!record) return;

    try {
      // Buscar dados completos para impressão
      const { data: fullRecord, error } = await supabase
        .from('patient_records')
        .select(`
          *,
          professionals(name, specialty, crm_cro),
          appointments(
            start_time,
            end_time,
            procedures(name),
            patients(
              full_name,
              cpf,
              phone,
              email,
              birth_date,
              gender,
              street,
              number,
              neighborhood,
              city,
              state
            )
          )
        `)
        .eq('id', record.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching record for print:', error);
        throw error;
      }
      
      if (!fullRecord) {
        toast({
          title: 'Erro',
          description: 'Registro não encontrado para impressão',
          variant: 'destructive',
        });
        return;
      }

      // Criar conteúdo HTML para impressão
      const printContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prontuário Médico</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { background: #f0f0f0; padding: 10px; margin: 0 0 15px 0; border-left: 4px solid #007bff; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { margin-bottom: 8px; }
            .info-item strong { display: inline-block; min-width: 120px; }
            .prescription { background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PRONTUÁRIO MÉDICO</h1>
            <p><strong>Data do Registro:</strong> ${format(new Date(fullRecord.created_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</p>
          </div>

          <div class="section">
            <h3>DADOS DO PACIENTE</h3>
            <div class="info-grid">
              <div>
                <div class="info-item"><strong>Nome:</strong> ${fullRecord.appointments?.patients?.full_name || 'Não informado'}</div>
                <div class="info-item"><strong>CPF:</strong> ${fullRecord.appointments?.patients?.cpf || 'Não informado'}</div>
                <div class="info-item"><strong>Telefone:</strong> ${fullRecord.appointments?.patients?.phone || 'Não informado'}</div>
                <div class="info-item"><strong>Email:</strong> ${fullRecord.appointments?.patients?.email || 'Não informado'}</div>
              </div>
              <div>
                <div class="info-item"><strong>Data de Nascimento:</strong> ${fullRecord.appointments?.patients?.birth_date ? format(new Date(fullRecord.appointments.patients.birth_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado'}</div>
                <div class="info-item"><strong>Sexo:</strong> ${fullRecord.appointments?.patients?.gender || 'Não informado'}</div>
              </div>
            </div>
            
            ${fullRecord.appointments?.patients?.street ? `
            <div class="info-item"><strong>Endereço:</strong> ${fullRecord.appointments.patients.street}, ${fullRecord.appointments.patients.number || 's/n'} - ${fullRecord.appointments.patients.neighborhood || ''} - ${fullRecord.appointments.patients.city || ''} - ${fullRecord.appointments.patients.state || ''}</div>
            ` : ''}
          </div>

          <div class="section">
            <h3>DADOS DO PROFISSIONAL</h3>
            <div class="info-item"><strong>Nome:</strong> Dr(a). ${fullRecord.professionals?.name || 'Não informado'}</div>
            ${fullRecord.professionals?.specialty ? `<div class="info-item"><strong>Especialidade:</strong> ${fullRecord.professionals.specialty}</div>` : ''}
            ${fullRecord.professionals?.crm_cro ? `<div class="info-item"><strong>CRM/CRO:</strong> ${fullRecord.professionals.crm_cro}</div>` : ''}
          </div>

          <div class="section">
            <h3>DADOS DA CONSULTA</h3>
            <div class="info-item"><strong>Título:</strong> ${fullRecord.title || 'Não informado'}</div>
            ${fullRecord.appointments ? `
            <div class="info-item"><strong>Data/Hora:</strong> ${format(new Date(fullRecord.appointments.start_time), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</div>
            <div class="info-item"><strong>Procedimento:</strong> ${fullRecord.appointments.procedures?.name || 'Não informado'}</div>
            ` : ''}
          </div>

          ${fullRecord.content || fullRecord.notes ? `
          <div class="section">
            <h3>ANOTAÇÕES DA CONSULTA</h3>
            <div style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px;">
              ${fullRecord.content || fullRecord.notes}
            </div>
          </div>
          ` : ''}

          ${fullRecord.prescription ? `
          <div class="section">
            <h3>RECEITA/PRESCRIÇÃO MÉDICA</h3>
            <div class="prescription">
              <div style="white-space: pre-wrap;">${fullRecord.prescription}</div>
            </div>
          </div>
          ` : ''}

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
            <p>Documento gerado em ${format(new Date(), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</p>
          </div>
        </body>
        </html>
      `;

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Error printing record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar impressão do prontuário',
        variant: 'destructive',
      });
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
        professional_id: formData.professional_id
      });

      const updateData = {
        title: formData.title.trim(),
        content: formData.content?.trim() || null,
        notes: formData.content?.trim() || null, // Also save in notes for backward compatibility
        prescription: formData.prescription?.trim() || null,
        appointment_id: formData.appointment_id === 'none' ? null : formData.appointment_id,
        professional_id: formData.professional_id || null,
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

      console.log('✅ Record saved successfully to database with all content including tables');

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
        description: 'Registro atualizado com sucesso incluindo todas as tabelas!',
      });

      // Refresh data
      onRecordUpdated();
      fetchDocuments();
      setFiles([]);
      
      // Verify the save worked by fetching the data again
      setTimeout(() => {
        fetchRecordDetails(record.id);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
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
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir Prontuário
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
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

           {/* Agendamento Vinculado */}
          <div className="space-y-2">
            <Label htmlFor="appointment" className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agendamento Vinculado
            </Label>
            <Select 
              value={formData.appointment_id} 
              onValueChange={(value) => setFormData({ ...formData, appointment_id: value })}
              disabled={loadingAppointments}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={loadingAppointments ? "Carregando agendamentos..." : "Selecione um agendamento"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum agendamento</SelectItem>
                {appointments.map((appointment) => (
                  <SelectItem key={appointment.id} value={appointment.id}>
                    {format(new Date(appointment.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {appointment.procedures?.name || 'Sem procedimento'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Você pode alterar o agendamento vinculado a este prontuário
            </p>
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
              key={`content-${record?.id}-${dataLoaded}`} // Force remount when data loads
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
                key={`prescription-${record?.id}-${dataLoaded}`} // Force remount when data loads
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

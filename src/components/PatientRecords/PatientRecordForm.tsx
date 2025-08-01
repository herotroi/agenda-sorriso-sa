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
import { FileText, Upload, X, Calendar, User, Clock, DollarSign, Stethoscope, Pill } from 'lucide-react';

interface PatientRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
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

interface FileUpload {
  file: File;
  description: string;
  preview?: string;
}

export function PatientRecordForm({ isOpen, onClose, patientId }: PatientRecordFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prescription, setPrescription] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  
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

  useEffect(() => {
    if (isOpen && patientId && user?.id) {
      fetchAppointments();
    }
  }, [isOpen, patientId, user?.id]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setPrescription('');
      setSelectedAppointments([]);
      setFiles([]);
      setAppointments([]);
    }
  }, [isOpen]);

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

    setLoading(true);

    try {
      const recordData = {
        title: title.trim(),
        content: content.trim() || null,
        notes: content.trim() || null,
        prescription: prescription.trim() || null,
        patient_id: patientId,
        user_id: user.id,
        created_by: user.id,
      };

      const { data: record, error: recordError } = await supabase
        .from('patient_records')
        .insert(recordData)
        .select()
        .single();

      if (recordError) throw recordError;

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

      if (files.length > 0) {
        const uploadPromises = files.map(fileUpload => uploadFile(fileUpload, record.id));
        
        try {
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Error uploading some files:', uploadError);
          toast({
            title: 'Aviso',
            description: 'Prontuário criado, mas alguns arquivos não puderam ser enviados',
            variant: 'default',
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Prontuário criado com sucesso',
      });

      onClose();
    } catch (error) {
      console.error('Error creating patient record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar prontuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Novo Prontuário
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

              <div>
                <Label htmlFor="content">Anotações da Consulta</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva os detalhes da consulta, observações importantes, sintomas relatados, exame físico, diagnóstico, tratamento recomendado, orientações..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="prescription" className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-green-600" />
                  Receita/Prescrição Médica
                </Label>
                <Textarea
                  id="prescription"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Liste os medicamentos prescritos, dosagens, frequência, duração do tratamento, instruções especiais..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Medicamentos, dosagens e instruções de uso (campo opcional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Selection */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Agendamentos Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fetchingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600">Carregando agendamentos...</span>
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-gray-500 py-4">Nenhum agendamento encontrado para este paciente.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
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

          {/* File Upload */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Documentos e Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="files">Adicionar Arquivos</Label>
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
                  Criando...
                </>
              ) : (
                'Criar Prontuário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

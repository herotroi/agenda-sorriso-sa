import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Stethoscope, Pill, Calendar, User, Upload, X, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

interface EditRecordDialogProps {
  record: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdated: () => void;
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

export function EditRecordDialog({ record, isOpen, onClose, onRecordUpdated }: EditRecordDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prescription: '',
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (record) {
      setFormData({
        title: record.title || '',
        content: record.content || record.notes || '',
        prescription: record.prescription || '',
      });
      fetchDocuments();
    } else {
      setFormData({
        title: '',
        content: '',
        prescription: '',
      });
      setDocuments([]);
      setFiles([]);
    }
  }, [record]);

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
    
    // Reset input
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
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
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
      // Update record
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        notes: formData.content.trim() || null,
        prescription: formData.prescription.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('patient_records')
        .update(updateData)
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Upload new files
      if (files.length > 0) {
        const uploadPromises = files.map(fileUpload => uploadFile(fileUpload));
        
        try {
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Error uploading some files:', uploadError);
          toast({
            title: 'Aviso',
            description: 'Registro atualizado, mas alguns arquivos não puderam ser enviados',
            variant: 'default',
          });
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Registro atualizado com sucesso',
      });

      onRecordUpdated();
      fetchDocuments();
      setFiles([]);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar registro',
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

          {/* Anotações da Consulta */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Anotações da Consulta
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descreva as observações da consulta, sintomas relatados, exame físico, diagnóstico, tratamento recomendado, orientações..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Receita/Prescrição */}
          <div className="space-y-2">
            <Label htmlFor="prescription" className="text-base font-medium flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Receita/Prescrição Médica
            </Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Liste os medicamentos prescritos, dosagens, frequência, duração do tratamento, instruções especiais..."
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Medicamentos, dosagens e instruções de uso (campo opcional)
            </p>
          </div>

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
          
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, FileText, Pill, Calendar, Upload, X, File } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
}

interface PatientRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

interface UploadedFile {
  file: File;
  description: string;
  id: string;
}

export function PatientRecordForm({ isOpen, onClose, patientId }: PatientRecordFormProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [formData, setFormData] = useState({
    professional_id: '',
    notes: '',
    prescription: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfessionals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name')
        .eq('active', true)
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
      setFormData({
        professional_id: '',
        notes: '',
        prescription: '',
      });
      setUploadedFiles([]);
    }
  }, [isOpen, user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: `Arquivo ${file.name} muito grande. Tamanho máximo: 10MB`,
          variant: 'destructive',
        });
        return;
      }

      const newFile: UploadedFile = {
        file,
        description: '',
        id: Math.random().toString(36).substring(2),
      };

      setUploadedFiles(prev => [...prev, newFile]);
    });

    // Limpar input
    event.target.value = '';
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setUploadedFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, description } : f)
    );
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFilesToStorage = async () => {
    const uploadPromises = uploadedFiles.map(async (fileData) => {
      const fileExt = fileData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileData.file);

      if (uploadError) throw uploadError;

      // Retornar dados para inserir no banco
      return {
        patient_id: patientId,
        name: fileData.file.name,
        file_path: filePath,
        file_size: fileData.file.size,
        mime_type: fileData.file.type,
        description: fileData.description || null,
        user_id: user!.id,
      };
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !formData.professional_id || !formData.notes || !user) return;

    setLoading(true);
    try {
      // 1. Criar o registro da consulta
      const { data: recordData, error: recordError } = await supabase
        .from('patient_records')
        .insert({
          patient_id: patientId,
          professional_id: formData.professional_id,
          notes: formData.notes,
          prescription: formData.prescription || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 2. Upload dos arquivos se houver
      if (uploadedFiles.length > 0) {
        const fileMetadata = await uploadFilesToStorage();
        
        // Associar arquivos ao registro criado
        const documentsToInsert = fileMetadata.map(meta => ({
          ...meta,
          record_id: recordData.id,
        }));

        const { error: documentsError } = await supabase
          .from('prontuario_documents')
          .insert(documentsToInsert);

        if (documentsError) throw documentsError;
      }

      toast({
        title: 'Sucesso',
        description: 'Consulta registrada com sucesso',
      });

      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar consulta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            Nova Consulta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Selection Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Profissional Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.professional_id} 
                onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o profissional responsável pela consulta" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Dr(a).
                        </Badge>
                        {prof.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Clinical Notes Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
                Notas da Consulta
                <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={8}
                placeholder="Descreva detalhadamente:
• Queixa principal do paciente
• Exame físico realizado
• Diagnóstico ou hipótese diagnóstica
• Procedimentos realizados
• Orientações fornecidas ao paciente
• Observações clínicas relevantes"
                className="text-base resize-none focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.notes.length} caracteres
              </div>
            </CardContent>
          </Card>

          {/* Prescription Card */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-4 w-4" />
                Receita / Prescrição
                <Badge variant="secondary" className="text-xs">Opcional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                rows={6}
                placeholder="Prescreva medicamentos, tratamentos ou orientações:
• Medicamentos com dosagem e posologia
• Tratamentos complementares
• Recomendações de exames
• Orientações de retorno
• Cuidados especiais"
                className="text-base resize-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.prescription.length} caracteres
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-4 w-4" />
                Arquivos da Consulta
                <Badge variant="secondary" className="text-xs">Opcional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center hover:border-purple-300 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                      <p className="text-sm font-medium">Clique para adicionar arquivos</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB cada)
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    className="hidden"
                  />
                </div>

                {/* Lista de arquivos selecionados */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Arquivos selecionados:</h4>
                    {uploadedFiles.map((fileData) => (
                      <div key={fileData.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <File className="h-4 w-4 text-purple-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(fileData.file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileData.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Descrição do arquivo (opcional)"
                          value={fileData.description}
                          onChange={(e) => updateFileDescription(fileData.id, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.professional_id || !formData.notes}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Consulta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

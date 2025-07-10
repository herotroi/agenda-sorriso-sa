
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Eye, 
  Trash2, 
  Plus,
  File,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  description?: string;
}

interface DocumentManagerProps {
  appointmentId: string | null;
  documents: Document[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
}

export function DocumentManager({ 
  appointmentId, 
  documents, 
  onDocumentUpload, 
  onDocumentDelete 
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filtrar documentos por appointment se selecionado
  const filteredDocuments = appointmentId 
    ? documents.filter(doc => doc.id.includes(appointmentId)) // Simulação de filtro
    : documents;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'Arquivo muito grande. Tamanho máximo: 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onDocumentUpload(selectedFile, uploadDescription);
      setSelectedFile(null);
      setUploadDescription('');
      setIsUploadDialogOpen(false);
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
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await onDocumentDelete(documentId);
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
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documentos ({filteredDocuments.length})
          </CardTitle>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Documento</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o documento..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {appointmentId && (
          <p className="text-sm text-muted-foreground">
            Mostrando documentos do procedimento selecionado
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {appointmentId 
                ? 'Nenhum documento para este procedimento' 
                : 'Nenhum documento encontrado'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{doc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => window.open(doc.url, '_blank')}
                    title="Visualizar documento"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDelete(doc.id)}
                    title="Excluir documento"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

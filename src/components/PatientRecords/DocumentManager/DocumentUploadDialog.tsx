
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DocumentUploadDialogProps {
  onDocumentUpload: (file: File, description: string) => Promise<void>;
}

export function DocumentUploadDialog({ onDocumentUpload }: DocumentUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (maximum 10MB)
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
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
  );
}

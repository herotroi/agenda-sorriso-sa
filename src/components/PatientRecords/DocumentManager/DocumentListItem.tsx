
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, File, Image as ImageIcon, Calendar, User } from 'lucide-react';
import type { ProntuarioDocument, Appointment } from '@/types/prontuario';

interface DocumentListItemProps {
  document: ProntuarioDocument;
  onDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
}

export function DocumentListItem({ document, onDelete, appointments }: DocumentListItemProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentUrl = (doc: ProntuarioDocument) => {
    if (doc.url) return doc.url;
    return `https://qxsaiuojxdnsanyivcxd.supabase.co/storage/v1/object/public/documents/${doc.file_path}`;
  };

  // Find the appointment associated with this document
  const associatedAppointment = appointments.find(apt => apt.id === document.appointment_id);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await onDelete(document.id);
      } catch (error) {
        // Error handling is done in the parent component
      }
    }
  };

  return (
    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        {getFileIcon(document.mime_type)}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{document.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{formatFileSize(document.file_size || document.size || 0)}</span>
            <span>•</span>
            <span>{new Date(document.uploaded_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          {/* Show procedure and professional information */}
          {associatedAppointment && (
            <div className="flex flex-wrap gap-1 mt-2">
              {associatedAppointment.procedures?.name && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {associatedAppointment.procedures.name}
                </Badge>
              )}
              {associatedAppointment.professionals?.name && (
                <Badge variant="outline" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Dr(a). {associatedAppointment.professionals.name}
                </Badge>
              )}
            </div>
          )}
          
          {document.description && (
            <p className="text-xs text-gray-600 mt-1 truncate">{document.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1 ml-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => window.open(getDocumentUrl(document), '_blank')}
          title="Visualizar documento"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleDelete}
          title="Excluir documento"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

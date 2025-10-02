
import { Download, Trash2, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProntuarioDocument, Appointment } from '@/types/prontuario';

interface DocumentListItemProps {
  document: ProntuarioDocument;
  onDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
  canDelete: boolean;
}

export function DocumentListItem({ 
  document, 
  onDelete, 
  appointments,
  canDelete 
}: DocumentListItemProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.open(document.url, '_blank');
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      await onDelete(document.id);
    }
  };

  const getAppointmentInfo = () => {
    if (!document.appointment_id) return null;
    const appointment = appointments.find(apt => apt.id === document.appointment_id);
    if (!appointment) return null;
    return new Date(appointment.start_time).toLocaleDateString('pt-BR');
  };

  const appointmentDate = getAppointmentInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-2.5 sm:p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-0.5 sm:mt-0">
          {getFileIcon(document.mime_type)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 break-words">
            {document.name}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
            <p className="text-xs text-gray-500">
              {formatFileSize(document.file_size)}
            </p>
            {appointmentDate && (
              <Badge variant="outline" className="text-xs w-fit">
                {appointmentDate}
              </Badge>
            )}
          </div>
          {document.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">
              {document.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1 sm:flex-initial"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="ml-1 sm:hidden text-xs">Download</span>
        </Button>
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 sm:flex-initial"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            <span className="ml-1 sm:hidden text-xs">Excluir</span>
          </Button>
        )}
      </div>
    </div>
  );
}


import { CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import type { ProntuarioDocument } from '@/types/prontuario';

interface DocumentManagerHeaderProps {
  documents: ProntuarioDocument[];
  appointmentId: string | null;
  onDocumentUpload: (file: File, description: string) => Promise<void>;
}

export function DocumentManagerHeader({ 
  documents, 
  appointmentId, 
  onDocumentUpload 
}: DocumentManagerHeaderProps) {
  // Filter documents by appointment if selected
  const filteredDocuments = appointmentId 
    ? documents.filter(doc => doc.appointment_id === appointmentId)
    : documents;

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Documentos ({filteredDocuments.length})
        </CardTitle>
        
        <DocumentUploadDialog onDocumentUpload={onDocumentUpload} />
      </div>
      
      {appointmentId && (
        <p className="text-sm text-muted-foreground">
          Mostrando documentos do procedimento selecionado
        </p>
      )}
    </CardHeader>
  );
}

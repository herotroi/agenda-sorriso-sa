
import { FileText } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import type { ProntuarioDocument } from '@/types/prontuario';

interface DocumentManagerHeaderProps {
  documents: ProntuarioDocument[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  canUpload: boolean;
}

export function DocumentManagerHeader({ 
  documents, 
  onDocumentUpload,
  canUpload 
}: DocumentManagerHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 sm:pb-3 px-3 sm:px-6">
      <CardTitle className="flex items-center text-sm sm:text-base font-medium">
        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate">Documentos ({documents.length})</span>
      </CardTitle>
      {canUpload && (
        <DocumentUploadDialog onDocumentUpload={onDocumentUpload} />
      )}
    </CardHeader>
  );
}

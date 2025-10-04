
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
    <CardHeader className="flex flex-col gap-2 sm:gap-3 pb-3 sm:pb-4 px-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center text-sm sm:text-base font-medium">
          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Documentos ({documents.length})</span>
        </CardTitle>
        {canUpload && (
          <div className="w-full sm:w-auto">
            <DocumentUploadDialog onDocumentUpload={onDocumentUpload} />
          </div>
        )}
      </div>
    </CardHeader>
  );
}

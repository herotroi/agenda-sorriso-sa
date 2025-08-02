
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
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="flex items-center text-sm font-medium">
        <FileText className="h-4 w-4 mr-2" />
        Documentos do Cliente ({documents.length})
      </CardTitle>
      {canUpload && (
        <DocumentUploadDialog onDocumentUpload={onDocumentUpload} />
      )}
    </CardHeader>
  );
}


import { Card, CardContent } from '@/components/ui/card';
import { DocumentManagerHeader } from './DocumentManager/DocumentManagerHeader';
import { DocumentList } from './DocumentManager/DocumentList';
import type { ProntuarioDocument } from '@/types/prontuario';

interface DocumentManagerProps {
  appointmentId: string | null;
  documents: ProntuarioDocument[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
}

export function DocumentManager({ 
  appointmentId, 
  documents, 
  onDocumentUpload, 
  onDocumentDelete 
}: DocumentManagerProps) {
  return (
    <Card>
      <DocumentManagerHeader
        documents={documents}
        appointmentId={appointmentId}
        onDocumentUpload={onDocumentUpload}
      />
      
      <CardContent>
        <DocumentList
          documents={documents}
          appointmentId={appointmentId}
          onDocumentDelete={onDocumentDelete}
        />
      </CardContent>
    </Card>
  );
}

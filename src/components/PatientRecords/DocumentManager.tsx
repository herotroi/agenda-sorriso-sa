
import { Card, CardContent } from '@/components/ui/card';
import { DocumentManagerHeader } from './DocumentManager/DocumentManagerHeader';
import { DocumentList } from './DocumentManager/DocumentList';
import type { ProntuarioDocument, Appointment } from '@/types/prontuario';

interface DocumentManagerProps {
  appointmentId: string | null;
  documents: ProntuarioDocument[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
  canUpload: boolean;
}

export function DocumentManager({ 
  appointmentId, 
  documents, 
  onDocumentUpload, 
  onDocumentDelete,
  appointments,
  canUpload
}: DocumentManagerProps) {
  return (
    <Card>
      <DocumentManagerHeader
        documents={documents}
        onDocumentUpload={onDocumentUpload}
        canUpload={canUpload}
      />
      
      <CardContent>
        <DocumentList
          documents={documents}
          onDocumentDelete={onDocumentDelete}
          appointments={appointments}
          canDelete={canUpload}
        />
      </CardContent>
    </Card>
  );
}

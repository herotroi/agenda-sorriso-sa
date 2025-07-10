
import { FileText } from 'lucide-react';
import { DocumentListItem } from './DocumentListItem';
import type { ProntuarioDocument, Appointment } from '@/types/prontuario';

interface DocumentListProps {
  documents: ProntuarioDocument[];
  appointmentId: string | null;
  onDocumentDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
}

export function DocumentList({ documents, appointmentId, onDocumentDelete, appointments }: DocumentListProps) {
  // Filter documents by appointment if selected
  const filteredDocuments = appointmentId 
    ? documents.filter(doc => doc.appointment_id === appointmentId)
    : documents;

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">
          {appointmentId 
            ? 'Nenhum documento para este procedimento' 
            : 'Nenhum documento encontrado'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {filteredDocuments.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          onDelete={onDocumentDelete}
          appointments={appointments}
        />
      ))}
    </div>
  );
}

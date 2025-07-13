
import { DocumentListItem } from './DocumentListItem';
import type { Appointment, ProntuarioDocument } from '@/types/prontuario';

interface DocumentListProps {
  documents: ProntuarioDocument[];
  appointmentId: string | null;
  onDocumentDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
  canDelete: boolean;
}

export function DocumentList({
  documents,
  appointmentId,
  onDocumentDelete,
  appointments,
  canDelete,
}: DocumentListProps) {
  const filteredDocuments = appointmentId
    ? documents.filter((doc) => doc.appointment_id === appointmentId)
    : documents;

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum documento encontrado</p>
        {!canDelete && (
          <p className="text-xs mt-2">Upgrade necessário para adicionar documentos</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredDocuments.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          onDelete={onDocumentDelete}
          appointments={appointments}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}

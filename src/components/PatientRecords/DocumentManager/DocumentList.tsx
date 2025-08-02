
import { DocumentListItem } from './DocumentListItem';
import type { Appointment, ProntuarioDocument } from '@/types/prontuario';

interface DocumentListProps {
  documents: ProntuarioDocument[];
  onDocumentDelete: (documentId: string) => Promise<void>;
  appointments: Appointment[];
  canDelete: boolean;
}

export function DocumentList({
  documents,
  onDocumentDelete,
  appointments,
  canDelete,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum documento encontrado para este cliente</p>
        {!canDelete && (
          <p className="text-xs mt-2">Upgrade necessário para adicionar documentos</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
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

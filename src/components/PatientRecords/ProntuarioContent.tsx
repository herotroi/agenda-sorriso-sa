
import { AppointmentsList } from './AppointmentsList';
import { DocumentManager } from './DocumentManager';
import type { Appointment, ProntuarioDocument } from '@/types/prontuario';

interface ProntuarioContentProps {
  appointments: Appointment[];
  selectedAppointment: string | null;
  onAppointmentSelect: (appointmentId: string) => void;
  loading: boolean;
  documents: ProntuarioDocument[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
  onClearSelection: () => void;
  canCreate: boolean;
}

export function ProntuarioContent({
  appointments,
  selectedAppointment,
  onAppointmentSelect,
  loading,
  documents,
  onDocumentUpload,
  onDocumentDelete,
  onClearSelection,
  canCreate,
}: ProntuarioContentProps) {
  return (
    <div className="space-y-6">
      {/* Appointments */}
      <AppointmentsList
        appointments={appointments}
        selectedAppointment={selectedAppointment}
        onAppointmentSelect={onAppointmentSelect}
        loading={loading}
        onClearSelection={onClearSelection}
      />

      {/* Documents */}
      <DocumentManager
        appointmentId={selectedAppointment}
        documents={documents}
        onDocumentUpload={onDocumentUpload}
        onDocumentDelete={onDocumentDelete}
        appointments={appointments}
        canUpload={canCreate}
      />
    </div>
  );
}

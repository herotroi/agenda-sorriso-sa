
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
}: ProntuarioContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Appointments */}
      <AppointmentsList
        appointments={appointments}
        selectedAppointment={selectedAppointment}
        onAppointmentSelect={onAppointmentSelect}
        loading={loading}
        onClearSelection={onClearSelection}
      />

      {/* Right Column - Documents */}
      <DocumentManager
        appointmentId={selectedAppointment}
        documents={documents}
        onDocumentUpload={onDocumentUpload}
        onDocumentDelete={onDocumentDelete}
        appointments={appointments}
      />
    </div>
  );
}

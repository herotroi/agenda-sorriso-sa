
import { AppointmentsList } from './AppointmentsList';
import { DocumentManager } from './DocumentManager';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price?: number;
  procedures: { name: string } | null;
  professionals: { name: string } | null;
}

interface ProntuarioDocument {
  id: string;
  name: string;
  type?: string;
  mime_type: string;
  file_size: number;
  size?: number;
  url?: string;
  file_path: string;
  uploaded_at: string;
  description?: string;
  patient_id?: string;
  appointment_id?: string;
  record_id?: string;
}

interface ProntuarioContentProps {
  appointments: Appointment[];
  selectedAppointment: string | null;
  onAppointmentSelect: (appointmentId: string) => void;
  loading: boolean;
  documents: ProntuarioDocument[];
  onDocumentUpload: (file: File, description: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
}

export function ProntuarioContent({
  appointments,
  selectedAppointment,
  onAppointmentSelect,
  loading,
  documents,
  onDocumentUpload,
  onDocumentDelete,
}: ProntuarioContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Appointments */}
      <AppointmentsList
        appointments={appointments}
        selectedAppointment={selectedAppointment}
        onAppointmentSelect={onAppointmentSelect}
        loading={loading}
      />

      {/* Right Column - Documents */}
      <DocumentManager
        appointmentId={selectedAppointment}
        documents={documents}
        onDocumentUpload={onDocumentUpload}
        onDocumentDelete={onDocumentDelete}
      />
    </div>
  );
}

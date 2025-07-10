
export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  procedure_id: string | null;
  start_time: string;
  end_time: string;
  status_id: number;
  notes: string | null;
  patients: { full_name: string };
  professionals: { name: string };
  procedures: { name: string } | null;
  appointment_statuses: { label: string; color: string };
}

export interface EditingCell {
  appointmentId: string;
  field: string;
  value: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

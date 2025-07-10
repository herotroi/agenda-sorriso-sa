
export interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  price?: number;
  procedures: { name: string } | null;
  professionals: { name: string } | null;
}

export interface ProntuarioDocument {
  id: string;
  name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  uploaded_at: string;
  description?: string;
  patient_id?: string;
  appointment_id?: string;
  record_id?: string;
  type?: string;
  size?: number;
  url?: string;
}

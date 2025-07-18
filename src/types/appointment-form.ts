
export interface AppointmentFormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  duration: string;
  notes: string;
  status_id: number;
  is_blocked?: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty?: string;
  color?: string;
}

export interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
}

export interface AppointmentStatus {
  id: number;
  label: string;
  color?: string;
}

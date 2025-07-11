
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
  description?: string;
  professionals?: Professional[];
}

export interface AppointmentStatus {
  id: number;
  label: string;
  key: string;
  color?: string;
}

export interface AppointmentFormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  end_time: string;
  status_id: number;
  notes: string;
  price: number;
  duration: string;
}

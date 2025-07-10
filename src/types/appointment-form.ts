
export interface Patient {
  id: string;
  full_name: string;
}

export interface Professional {
  id: string;
  name: string;
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
  key: string;
}

export interface FormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  duration: string;
  notes: string;
  status_id: number;
}

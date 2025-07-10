
export interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  sus_card?: string;
  health_insurance?: string;
  birth_date?: string;
  notes?: string;
  active?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  specialty?: string;
  active?: boolean;
}

export interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  active?: boolean;
}

export interface AppointmentStatus {
  id: number;
  key: string;
  label: string;
  color?: string;
  active?: boolean;
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

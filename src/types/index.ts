export interface Patient {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  cpf?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  user_id: string;
  address?: string;
  gender?: string;
  notes?: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  color?: string;
  calendarColor?: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  user_id: string;
  break_times?: string | any[];
  working_days?: string;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
}

export interface Appointment {
  id: string;
  patient_id?: string | null;
  patientId?: string | null;
  professional_id?: string;
  professionalId?: string;
  procedure_id?: string | null;
  procedureId?: string | null;
  start_time: string;
  startTime: string;
  end_time: string;
  endTime: string;
  notes?: string;
  price?: number;
  status?: string;
  status_id?: number;
  created_at: string;
  createdAt: string;
  updated_at: string;
  date: string;
  user_id: string;
  is_blocked?: boolean;
  isBlocked?: boolean;
  
  // Relacionamentos
  patients?: {
    full_name: string;
  } | null;
  professionals?: {
    name: string;
    color?: string;
  };
  procedures?: {
    name: string;
  } | null;
  appointment_statuses?: {
    label: string;
    color: string;
  };
}

export interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  active: boolean;
}

export interface ApiResponse<T> {
  data: T[] | null;
  error: any;
}

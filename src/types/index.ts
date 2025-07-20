
export type AppointmentStatus = 'confirmado' | 'cancelado' | 'faltou' | 'em-andamento' | 'concluido';

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
  color: string;
  calendarColor?: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  user_id: string;
  crm_cro?: string;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  // Propriedades obrigatórias padronizadas
  working_hours: { start: string; end: string };
  break_times: Array<{ start: string; end: string }>;
  working_days: boolean[];
}

export interface Appointment {
  id: string;
  patient_id?: string | null;
  professional_id?: string;
  procedure_id?: string | null;
  start_time: string;
  end_time: string;
  notes?: string;
  price?: number;
  status?: AppointmentStatus;
  status_id?: number;
  created_at: string;
  updated_at: string;
  date: string;
  user_id: string;
  is_blocked?: boolean;
  
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
  professionals?: Professional[];
}

export interface ApiResponse<T> {
  data: T[] | null;
  error: any;
}

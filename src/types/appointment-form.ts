
export interface AppointmentFormData {
  patient_id: string;
  professional_id: string;
  procedure_id: string;
  start_time: string;
  end_time: string;
  duration: string;
  notes: string;
  status_id: number;
  is_blocked?: boolean;
  payment_method?: string;
  payment_status?: string;
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
  color: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  active?: boolean;
  user_id: string;
  break_times?: string | any[];
  working_days?: string | boolean[];
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  crm_cro?: string;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
  working_hours?: any;
}

export interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  active?: boolean;
  professionals?: Professional[];
}

export interface AppointmentStatus {
  id: number;
  label: string;
  color?: string;
}

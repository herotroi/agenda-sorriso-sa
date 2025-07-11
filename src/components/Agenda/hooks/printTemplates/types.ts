
export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  price: number | null;
  professional_id: string | null;
  patients: { full_name: string } | null;
  professionals: { name: string } | null;
  procedures: { name: string } | null;
  appointment_statuses: { label: string; color: string } | null;
}

export interface Professional {
  id: string;
  name: string;
  active: boolean;
  break_times?: Array<{ start: string; end: string }>;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: boolean[];
}

export type AppointmentDisplayType = 'start' | 'continuation' | 'end';

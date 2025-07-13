
// Tipos principais do sistema
export interface Professional {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  cro: string; // Número do CRO
  services: string[];
  workingHours: WorkingHours;
  calendarColor: string;
  isActive: boolean;
  documents: string[];
  createdAt: string;
  // Database fields
  color?: string;
  working_hours?: any;
  active?: boolean;
  crm_cro?: string;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  break_times?: any;
  working_days?: boolean[];
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  address: Address;
  phone: string;
  email?: string;
  cpf: string;
  susCard?: string;
  healthInsurance?: string;
  medicalHistory: string;
  clinicalNotes: string[];
  createdAt: string;
  // Database fields
  full_name?: string;
  birth_date?: string;
  health_insurance?: string;
  sus_card?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  active?: boolean;
  notes?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Appointment {
  id: string;
  professionalId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  procedureId: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  // Database fields
  professional_id?: string;
  patient_id?: string;
  procedure_id?: string;
  start_time?: string;
  end_time?: string;
  status_id?: number;
  price?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  // Joined table fields
  patients?: { full_name: string } | null;
  professionals?: { name: string; color?: string } | null;
  procedures?: { name: string } | null;
  appointment_statuses?: { label: string; color: string } | null;
}

export type AppointmentStatus = 'confirmado' | 'cancelado' | 'faltou' | 'em-andamento' | 'concluido';

export interface Procedure {
  id: string;
  name: string;
  duration: number; // em minutos
  price: number;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string; // Se for um profissional
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'administrador' | 'profissional' | 'recepcionista';

export interface EHRRecord {
  id: string;
  patientId: string;
  professionalId: string;
  date: string;
  evolutionNotes: string;
  files: FileUpload[];
  prescriptions: Prescription[];
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  instructions: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'mensal' | 'anual';
  status: 'ativo' | 'cancelado' | 'pendente';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
}

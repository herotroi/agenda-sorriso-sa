
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

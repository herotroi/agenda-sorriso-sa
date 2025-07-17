
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
  photo_url?: string;
  gender?: string;
  profession?: string;
  marital_status?: string;
  weight_kg?: number;
  height_cm?: number;
  responsible_name?: string;
  responsible_cpf?: string;
}

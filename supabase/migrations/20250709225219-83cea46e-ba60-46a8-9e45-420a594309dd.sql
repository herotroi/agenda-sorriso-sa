
-- Create professionals table
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  crm_cro TEXT,
  email TEXT,
  phone TEXT,
  color TEXT DEFAULT '#3b82f6',
  working_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  sus_card TEXT,
  health_insurance TEXT,
  birth_date DATE,
  medical_history TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create procedures table
CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  default_duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no_show', 'in_progress', 'completed')),
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patient records table
CREATE TABLE public.patient_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  prescription TEXT,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - should be refined based on user roles)
CREATE POLICY "Enable all operations for professionals" ON public.professionals FOR ALL USING (true);
CREATE POLICY "Enable all operations for patients" ON public.patients FOR ALL USING (true);
CREATE POLICY "Enable all operations for procedures" ON public.procedures FOR ALL USING (true);
CREATE POLICY "Enable all operations for appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Enable all operations for patient_records" ON public.patient_records FOR ALL USING (true);
CREATE POLICY "Enable all operations for settings" ON public.settings FOR ALL USING (true);

-- Insert some sample data
INSERT INTO public.professionals (name, specialty, crm_cro, color) VALUES
('Dr. Silva', 'Ortodontia', 'CRO-12345', '#10b981'),
('Dra. Costa', 'Endodontia', 'CRO-67890', '#f59e0b'),
('Dr. Santos', 'Cirurgia', 'CRO-11111', '#ef4444');

INSERT INTO public.procedures (name, price, default_duration, description) VALUES
('Limpeza', 80.00, 60, 'Limpeza e profilaxia dental'),
('Obturação', 120.00, 90, 'Restauração com resina'),
('Canal', 350.00, 120, 'Tratamento endodôntico'),
('Extração', 150.00, 45, 'Extração dentária simples'),
('Clareamento', 250.00, 90, 'Clareamento dental');

INSERT INTO public.settings (key, value) VALUES
('working_hours', '{"start": "08:00", "end": "18:00"}'),
('clinic_name', '"ClinicPro"'),
('theme_color', '"#3b82f6"');

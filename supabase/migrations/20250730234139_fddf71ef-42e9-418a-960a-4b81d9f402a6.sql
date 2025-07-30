
-- Create the record_appointments junction table to link records with appointments
CREATE TABLE public.record_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL,
  appointment_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.record_appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for record_appointments
CREATE POLICY "Users can view their own record appointments" 
  ON public.record_appointments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM patient_records 
    WHERE patient_records.id = record_appointments.record_id 
    AND patient_records.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own record appointments" 
  ON public.record_appointments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM patient_records 
    WHERE patient_records.id = record_appointments.record_id 
    AND patient_records.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own record appointments" 
  ON public.record_appointments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM patient_records 
    WHERE patient_records.id = record_appointments.record_id 
    AND patient_records.user_id = auth.uid()
  ));

-- Update patient_records table to add title and content fields
ALTER TABLE public.patient_records 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Make notes field nullable since we're adding title/content
ALTER TABLE public.patient_records 
ALTER COLUMN notes DROP NOT NULL;

-- Add uploaded_by column to prontuario_documents if it doesn't exist
ALTER TABLE public.prontuario_documents 
ADD COLUMN IF NOT EXISTS uploaded_by UUID;


-- Criar bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Criar política para permitir upload de documentos
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Criar política para permitir visualização de documentos
CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Criar política para permitir exclusão de documentos
CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

-- Criar tabela para metadados dos documentos
CREATE TABLE public.prontuario_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  record_id UUID REFERENCES public.patient_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de documentos
ALTER TABLE public.prontuario_documents ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações na tabela de documentos
CREATE POLICY "Enable all operations for prontuario_documents" 
ON public.prontuario_documents FOR ALL USING (true);

-- Criar índices para melhor performance
CREATE INDEX idx_prontuario_documents_patient_id ON public.prontuario_documents(patient_id);
CREATE INDEX idx_prontuario_documents_appointment_id ON public.prontuario_documents(appointment_id);
CREATE INDEX idx_prontuario_documents_record_id ON public.prontuario_documents(record_id);

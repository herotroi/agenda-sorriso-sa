
-- Atualizar a tabela professionals para incluir novos campos de expediente, pausas e férias
ALTER TABLE public.professionals 
ADD COLUMN first_shift_start TIME,
ADD COLUMN first_shift_end TIME,
ADD COLUMN second_shift_start TIME,
ADD COLUMN second_shift_end TIME,
ADD COLUMN break_times JSONB DEFAULT '[]'::jsonb,
ADD COLUMN vacation_active BOOLEAN DEFAULT false,
ADD COLUMN vacation_start DATE,
ADD COLUMN vacation_end DATE;

-- Atualizar registros existentes para manter compatibilidade
UPDATE public.professionals 
SET 
  first_shift_start = '08:00'::time,
  first_shift_end = '12:00'::time,
  second_shift_start = '13:30'::time,
  second_shift_end = '18:00'::time
WHERE first_shift_start IS NULL;

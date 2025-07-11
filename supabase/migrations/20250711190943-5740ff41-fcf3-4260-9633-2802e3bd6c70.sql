
-- Adicionar campos para dias da semana e expediente de fim de semana
ALTER TABLE public.professionals 
ADD COLUMN working_days JSONB DEFAULT '[true, true, true, true, true, false, false]'::jsonb,
ADD COLUMN weekend_shift_active BOOLEAN DEFAULT false,
ADD COLUMN weekend_shift_start TIME,
ADD COLUMN weekend_shift_end TIME;

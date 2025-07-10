
-- Adicionar campo active na tabela patients
ALTER TABLE public.patients 
ADD COLUMN active BOOLEAN DEFAULT true;

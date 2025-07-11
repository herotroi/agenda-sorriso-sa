
-- Criar tabela para relacionar procedimentos com profissionais
CREATE TABLE public.procedure_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(procedure_id, professional_id)
);

-- Habilitar RLS
ALTER TABLE public.procedure_professionals ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações
CREATE POLICY "Enable all operations for procedure_professionals" 
ON public.procedure_professionals 
FOR ALL 
USING (true);

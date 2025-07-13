
-- Adicionar campo automacao na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS automacao BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela de cupons
CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  limite_uso INTEGER NOT NULL DEFAULT 10,
  uso_atual INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir o cupom HerotroiAutomaçãoClinic
INSERT INTO public.cupons (codigo, limite_uso, uso_atual, ativo) 
VALUES ('HerotroiAutomaçãoClinic', 10, 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Habilitar RLS na tabela cupons
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura dos cupons (necessário para validação)
CREATE POLICY "Anyone can view active coupons" ON public.cupons
FOR SELECT
USING (ativo = true);

-- Política para atualização de cupons (apenas para sistema)
CREATE POLICY "System can update coupons" ON public.cupons
FOR UPDATE
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_cupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cupons_updated_at
    BEFORE UPDATE ON public.cupons
    FOR EACH ROW
    EXECUTE FUNCTION update_cupons_updated_at();

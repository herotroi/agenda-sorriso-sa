
-- Adicionar novos campos na tabela patients
ALTER TABLE public.patients 
ADD COLUMN photo_url TEXT,
ADD COLUMN gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
ADD COLUMN profession TEXT,
ADD COLUMN marital_status TEXT CHECK (marital_status IN ('solteiro', 'casado', 'viuvo', 'divorciado', 'uniao_estavel')),
ADD COLUMN weight_kg DECIMAL(5,2),
ADD COLUMN height_cm INTEGER,
ADD COLUMN responsible_name TEXT,
ADD COLUMN responsible_cpf TEXT;

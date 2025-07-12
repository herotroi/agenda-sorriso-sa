
-- Adicionar colunas para dados pessoais, endereço e horários de atendimento na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN cpf TEXT,
ADD COLUMN cnpj TEXT,
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN working_hours_start TIME DEFAULT '08:00',
ADD COLUMN working_hours_end TIME DEFAULT '18:00';

-- Atualizar a função para criar perfil automaticamente com os novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    working_hours_start,
    working_hours_end
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    '08:00'::TIME,
    '18:00'::TIME
  );
  RETURN NEW;
END;
$$;


-- Adicionar coluna user_id às tabelas que não possuem
ALTER TABLE public.patients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.procedures ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.patient_records ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.prontuario_documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.procedure_professionals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar dados existentes com um usuário padrão (primeiro usuário encontrado)
-- IMPORTANTE: Substitua este UUID pelo ID do usuário correto se necessário
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Pegar o primeiro usuário da tabela auth.users
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- Atualizar todas as tabelas com este usuário
    UPDATE public.patients SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.professionals SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.procedures SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.appointments SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.patient_records SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.prontuario_documents SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.notifications SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE public.procedure_professionals SET user_id = first_user_id WHERE user_id IS NULL;
END $$;

-- Tornar user_id obrigatório (NOT NULL)
ALTER TABLE public.patients ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.professionals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.procedures ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.patient_records ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.prontuario_documents ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.procedure_professionals ALTER COLUMN user_id SET NOT NULL;

-- Remover as políticas RLS existentes que permitem acesso total
DROP POLICY IF EXISTS "Enable all operations for patients" ON public.patients;
DROP POLICY IF EXISTS "Enable all operations for professionals" ON public.professionals;
DROP POLICY IF EXISTS "Enable all operations for procedures" ON public.procedures;
DROP POLICY IF EXISTS "Enable all operations for appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable all operations for patient_records" ON public.patient_records;
DROP POLICY IF EXISTS "Enable all operations for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Enable all operations for procedure_professionals" ON public.procedure_professionals;
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON public.prontuario_documents;
DROP POLICY IF EXISTS "Allow authenticated users to insert documents" ON public.prontuario_documents;
DROP POLICY IF EXISTS "Allow authenticated users to update documents" ON public.prontuario_documents;
DROP POLICY IF EXISTS "Allow authenticated users to delete documents" ON public.prontuario_documents;

-- Criar novas políticas RLS baseadas no user_id
-- Pacientes
CREATE POLICY "Users can view their own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patients" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patients" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- Profissionais
CREATE POLICY "Users can view their own professionals" ON public.professionals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own professionals" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own professionals" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own professionals" ON public.professionals FOR DELETE USING (auth.uid() = user_id);

-- Procedimentos
CREATE POLICY "Users can view their own procedures" ON public.procedures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own procedures" ON public.procedures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own procedures" ON public.procedures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own procedures" ON public.procedures FOR DELETE USING (auth.uid() = user_id);

-- Agendamentos
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

-- Registros de pacientes
CREATE POLICY "Users can view their own patient_records" ON public.patient_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patient_records" ON public.patient_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient_records" ON public.patient_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient_records" ON public.patient_records FOR DELETE USING (auth.uid() = user_id);

-- Documentos do prontuário
CREATE POLICY "Users can view their own documents" ON public.prontuario_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON public.prontuario_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.prontuario_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.prontuario_documents FOR DELETE USING (auth.uid() = user_id);

-- Notificações
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Procedimentos dos profissionais
CREATE POLICY "Users can view their own procedure_professionals" ON public.procedure_professionals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own procedure_professionals" ON public.procedure_professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own procedure_professionals" ON public.procedure_professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own procedure_professionals" ON public.procedure_professionals FOR DELETE USING (auth.uid() = user_id);

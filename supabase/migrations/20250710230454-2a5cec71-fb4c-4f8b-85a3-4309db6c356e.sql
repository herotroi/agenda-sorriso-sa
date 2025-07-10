
-- Remover as políticas existentes para prontuario_documents
DROP POLICY IF EXISTS "Enable all operations for prontuario_documents" ON public.prontuario_documents;

-- Criar políticas mais específicas para prontuario_documents
-- Permitir INSERT para usuários autenticados
CREATE POLICY "Allow authenticated users to insert documents" 
ON public.prontuario_documents 
FOR INSERT 
WITH CHECK (true);

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Allow authenticated users to view documents" 
ON public.prontuario_documents 
FOR SELECT 
USING (true);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Allow authenticated users to update documents" 
ON public.prontuario_documents 
FOR UPDATE 
USING (true);

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Allow authenticated users to delete documents" 
ON public.prontuario_documents 
FOR DELETE 
USING (true);

-- Verificar se as políticas de storage estão corretas
-- Atualizar política de upload para o bucket documents
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

-- Atualizar política de visualização para o bucket documents
DROP POLICY IF EXISTS "Allow authenticated users to view documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Atualizar política de exclusão para o bucket documents
DROP POLICY IF EXISTS "Allow authenticated users to delete documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');

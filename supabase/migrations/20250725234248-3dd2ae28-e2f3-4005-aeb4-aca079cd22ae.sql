
-- Habilitar Row Level Security na tabela appointment_statuses
ALTER TABLE public.appointment_statuses ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que todos os usuários autenticados vejam os status
-- (necessário para o funcionamento da aplicação)
CREATE POLICY "Authenticated users can view appointment statuses" 
  ON public.appointment_statuses 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Criar política para impedir inserção por usuários comuns
-- (apenas administradores do sistema devem poder criar novos status)
CREATE POLICY "Only system can insert appointment statuses" 
  ON public.appointment_statuses 
  FOR INSERT 
  TO authenticated
  WITH CHECK (false);

-- Criar política para impedir atualizações por usuários comuns
CREATE POLICY "Only system can update appointment statuses" 
  ON public.appointment_statuses 
  FOR UPDATE 
  TO authenticated
  USING (false);

-- Criar política para impedir exclusões por usuários comuns
CREATE POLICY "Only system can delete appointment statuses" 
  ON public.appointment_statuses 
  FOR DELETE 
  TO authenticated
  USING (false);

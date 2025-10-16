-- Remover a policy antiga de delete
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Criar nova policy que permite delete apenas após 24 horas
CREATE POLICY "Users can delete notifications after 24h" 
ON public.notifications 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id 
  AND created_at < (now() - interval '24 hours')
);
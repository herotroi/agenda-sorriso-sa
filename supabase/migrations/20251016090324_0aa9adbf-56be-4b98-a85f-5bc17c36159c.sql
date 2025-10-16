-- Remover constraint antigo e adicionar novo com todos os tipos
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Adicionar novo constraint com todos os tipos de notificação
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'appointment_created',
    'appointment_updated', 
    'appointment_deleted',
    'appointment_reminder',
    'patient_created',
    'patient_updated',
    'patient_deleted',
    'procedure_created',
    'procedure_updated',
    'procedure_deleted',
    'record_created',
    'record_updated',
    'record_deleted',
    'settings_updated'
  ));
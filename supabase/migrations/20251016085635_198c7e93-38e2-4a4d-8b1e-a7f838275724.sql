-- ========================================
-- BLINDAGEM TOTAL CONTRA DUPLICAÇÃO DE NOTIFICAÇÕES
-- Abordagem: Trigger com verificação antes de inserir
-- ========================================

-- 1. Limpar duplicatas históricas existentes
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY 
        user_id, 
        type, 
        message, 
        date_trunc('second', created_at), 
        COALESCE(appointment_id::text, '')
      ORDER BY created_at
    ) AS rn
  FROM public.notifications
)
DELETE FROM public.notifications n
USING ranked r
WHERE n.id = r.id AND r.rn > 1;

-- 2. Remover triggers duplicadas programaticamente (appointments)
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    JOIN pg_proc p ON p.oid = tgfoid
    WHERE tgrelid = 'public.appointments'::regclass
      AND p.proname = 'fn_notify_appointments'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.appointments', t.tgname);
  END LOOP;
END $$;

-- 3. Remover triggers duplicadas (patients)
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    JOIN pg_proc p ON p.oid = tgfoid
    WHERE tgrelid = 'public.patients'::regclass
      AND p.proname = 'fn_notify_patients'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.patients', t.tgname);
  END LOOP;
END $$;

-- 4. Remover triggers duplicadas (procedures)
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    JOIN pg_proc p ON p.oid = tgfoid
    WHERE tgrelid = 'public.procedures'::regclass
      AND p.proname = 'fn_notify_procedures'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.procedures', t.tgname);
  END LOOP;
END $$;

-- 5. Remover triggers duplicadas (patient_records)
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    JOIN pg_proc p ON p.oid = tgfoid
    WHERE tgrelid = 'public.patient_records'::regclass
      AND p.proname = 'fn_notify_patient_records'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.patient_records', t.tgname);
  END LOOP;
END $$;

-- 6. Remover triggers duplicadas (profiles)
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tgname
    FROM pg_trigger
    JOIN pg_proc p ON p.oid = tgfoid
    WHERE tgrelid = 'public.profiles'::regclass
      AND p.proname = 'fn_notify_profiles'
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.profiles', t.tgname);
  END LOOP;
END $$;

-- 7. Atualizar função de notificação de appointments com verificação rigorosa
CREATE OR REPLACE FUNCTION public.fn_notify_appointments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  changed_fields text := '';
  notif_type text;
  notif_title text;
  notif_msg text;
  target_user uuid;
  target_appt uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user := NEW.user_id;
    target_appt := NEW.id;
    notif_type := 'appointment_created';
    notif_title := 'Novo Agendamento';
    notif_msg := 'Um novo agendamento foi criado';
    
  ELSIF TG_OP = 'UPDATE' THEN
    target_user := NEW.user_id;
    target_appt := NEW.id;
    
    IF NEW.start_time IS DISTINCT FROM OLD.start_time THEN 
      changed_fields := changed_fields || 'horário, '; 
    END IF;
    IF NEW.end_time IS DISTINCT FROM OLD.end_time THEN 
      changed_fields := changed_fields || 'duração, '; 
    END IF;
    IF NEW.status_id IS DISTINCT FROM OLD.status_id THEN 
      changed_fields := changed_fields || 'status, '; 
    END IF;
    IF NEW.professional_id IS DISTINCT FROM OLD.professional_id THEN 
      changed_fields := changed_fields || 'profissional, '; 
    END IF;
    IF NEW.procedure_id IS DISTINCT FROM OLD.procedure_id THEN 
      changed_fields := changed_fields || 'procedimento, '; 
    END IF;
    IF NEW.notes IS DISTINCT FROM OLD.notes THEN 
      changed_fields := changed_fields || 'observações, '; 
    END IF;
    IF NEW.payment_method IS DISTINCT FROM OLD.payment_method THEN 
      changed_fields := changed_fields || 'forma de pagamento, '; 
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN 
      changed_fields := changed_fields || 'status de pagamento, '; 
    END IF;
    
    changed_fields := trim(trailing ', ' from changed_fields);
    
    IF changed_fields = '' THEN
      RETURN NULL;
    END IF;
    
    notif_type := 'appointment_updated';
    notif_title := 'Agendamento Alterado';
    notif_msg := 'Agendamento foi modificado: ' || changed_fields;
    
  ELSIF TG_OP = 'DELETE' THEN
    target_user := OLD.user_id;
    target_appt := OLD.id;
    notif_type := 'appointment_deleted';
    notif_title := 'Agendamento Excluído';
    notif_msg := 'Um agendamento foi excluído';
  END IF;

  -- Verificação rigorosa para evitar duplicatas no mesmo segundo
  PERFORM 1 FROM notifications
  WHERE user_id = target_user
    AND type = notif_type
    AND appointment_id = target_appt
    AND message = notif_msg
    AND created_at > date_trunc('second', now())
    AND created_at < date_trunc('second', now()) + interval '1 second'
  FOR UPDATE SKIP LOCKED;
  
  IF FOUND THEN
    RETURN NULL;
  END IF;

  -- Inserção da notificação
  INSERT INTO notifications (title, message, type, appointment_id, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_appt, target_user);

  RETURN NULL;
END;
$function$;

-- 8. Atualizar função de notificação de patients
CREATE OR REPLACE FUNCTION public.fn_notify_patients()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notif_type text;
  notif_title text;
  notif_msg text;
  target_user uuid;
  patient_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user := NEW.user_id;
    patient_name := NEW.full_name;
    notif_type := 'patient_created';
    notif_title := 'Novo Paciente';
    notif_msg := 'Paciente "' || patient_name || '" foi cadastrado';
    
  ELSIF TG_OP = 'UPDATE' THEN
    target_user := NEW.user_id;
    patient_name := NEW.full_name;
    notif_type := 'patient_updated';
    notif_title := 'Paciente Alterado';
    notif_msg := 'Paciente "' || patient_name || '" foi atualizado';
    
  ELSIF TG_OP = 'DELETE' THEN
    target_user := OLD.user_id;
    patient_name := OLD.full_name;
    notif_type := 'patient_deleted';
    notif_title := 'Paciente Excluído';
    notif_msg := 'Paciente "' || patient_name || '" foi excluído';
  END IF;

  -- Verificação de duplicata no mesmo segundo
  PERFORM 1 FROM notifications
  WHERE user_id = target_user
    AND type = notif_type
    AND message = notif_msg
    AND created_at > date_trunc('second', now())
    AND created_at < date_trunc('second', now()) + interval '1 second'
  FOR UPDATE SKIP LOCKED;
  
  IF FOUND THEN
    RETURN NULL;
  END IF;

  -- Inserção da notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$function$;

-- 9. Atualizar função de notificação de procedures
CREATE OR REPLACE FUNCTION public.fn_notify_procedures()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notif_type text;
  notif_title text;
  notif_msg text;
  target_user uuid;
  procedure_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user := NEW.user_id;
    procedure_name := NEW.name;
    notif_type := 'procedure_created';
    notif_title := 'Novo Procedimento';
    notif_msg := 'Procedimento "' || procedure_name || '" foi cadastrado';
    
  ELSIF TG_OP = 'UPDATE' THEN
    target_user := NEW.user_id;
    procedure_name := NEW.name;
    notif_type := 'procedure_updated';
    notif_title := 'Procedimento Alterado';
    notif_msg := 'Procedimento "' || procedure_name || '" foi atualizado';
    
  ELSIF TG_OP = 'DELETE' THEN
    target_user := OLD.user_id;
    procedure_name := OLD.name;
    notif_type := 'procedure_deleted';
    notif_title := 'Procedimento Excluído';
    notif_msg := 'Procedimento "' || procedure_name || '" foi excluído';
  END IF;

  -- Verificação de duplicata no mesmo segundo
  PERFORM 1 FROM notifications
  WHERE user_id = target_user
    AND type = notif_type
    AND message = notif_msg
    AND created_at > date_trunc('second', now())
    AND created_at < date_trunc('second', now()) + interval '1 second'
  FOR UPDATE SKIP LOCKED;
  
  IF FOUND THEN
    RETURN NULL;
  END IF;

  -- Inserção da notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$function$;

-- 10. Atualizar função de notificação de patient_records
CREATE OR REPLACE FUNCTION public.fn_notify_patient_records()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notif_type text;
  notif_title text;
  notif_msg text;
  target_user uuid;
  record_title text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user := NEW.user_id;
    record_title := COALESCE(NEW.title, 'Prontuário');
    notif_type := 'record_created';
    notif_title := 'Novo Prontuário';
    notif_msg := 'Prontuário "' || record_title || '" foi criado';
    
  ELSIF TG_OP = 'UPDATE' THEN
    target_user := NEW.user_id;
    record_title := COALESCE(NEW.title, 'Prontuário');
    notif_type := 'record_updated';
    notif_title := 'Prontuário Alterado';
    notif_msg := 'Prontuário "' || record_title || '" foi atualizado';
    
  ELSIF TG_OP = 'DELETE' THEN
    target_user := OLD.user_id;
    record_title := COALESCE(OLD.title, 'Prontuário');
    notif_type := 'record_deleted';
    notif_title := 'Prontuário Excluído';
    notif_msg := 'Prontuário "' || record_title || '" foi excluído';
  END IF;

  -- Verificação de duplicata no mesmo segundo
  PERFORM 1 FROM notifications
  WHERE user_id = target_user
    AND type = notif_type
    AND message = notif_msg
    AND created_at > date_trunc('second', now())
    AND created_at < date_trunc('second', now()) + interval '1 second'
  FOR UPDATE SKIP LOCKED;
  
  IF FOUND THEN
    RETURN NULL;
  END IF;

  -- Inserção da notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$function$;

-- 11. Atualizar função de notificação de profiles
CREATE OR REPLACE FUNCTION public.fn_notify_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notif_type text;
  notif_title text;
  notif_msg text;
  target_user uuid;
BEGIN
  target_user := NEW.id;
  notif_type := 'settings_updated';
  notif_title := 'Configurações Atualizadas';
  notif_msg := 'Suas configurações foram atualizadas com sucesso';

  -- Verificação de duplicata no mesmo segundo
  PERFORM 1 FROM notifications
  WHERE user_id = target_user
    AND type = notif_type
    AND message = notif_msg
    AND created_at > date_trunc('second', now())
    AND created_at < date_trunc('second', now()) + interval '1 second'
  FOR UPDATE SKIP LOCKED;
  
  IF FOUND THEN
    RETURN NULL;
  END IF;

  -- Inserção da notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$function$;

-- 12. Recriar triggers oficiais para appointments
CREATE TRIGGER trg_appointments_insert
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

CREATE TRIGGER trg_appointments_update
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

CREATE TRIGGER trg_appointments_delete
  AFTER DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

-- 13. Recriar triggers oficiais para patients
CREATE TRIGGER trg_patients_insert
  AFTER INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

CREATE TRIGGER trg_patients_update
  AFTER UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

CREATE TRIGGER trg_patients_delete
  AFTER DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

-- 14. Recriar triggers oficiais para procedures
CREATE TRIGGER trg_procedures_insert
  AFTER INSERT ON public.procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

CREATE TRIGGER trg_procedures_update
  AFTER UPDATE ON public.procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

CREATE TRIGGER trg_procedures_delete
  AFTER DELETE ON public.procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

-- 15. Recriar triggers oficiais para patient_records
CREATE TRIGGER trg_patient_records_insert
  AFTER INSERT ON public.patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

CREATE TRIGGER trg_patient_records_update
  AFTER UPDATE ON public.patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

CREATE TRIGGER trg_patient_records_delete
  AFTER DELETE ON public.patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

-- 16. Recriar trigger oficial para profiles (apenas UPDATE)
CREATE TRIGGER trg_profiles_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_profiles();
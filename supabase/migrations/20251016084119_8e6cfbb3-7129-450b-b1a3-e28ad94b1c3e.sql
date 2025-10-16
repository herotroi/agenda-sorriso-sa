-- ============================================================================
-- TRIGGERS PARA NOTIFICAÇÕES AUTOMÁTICAS
-- Este script cria triggers que geram notificações automaticamente quando
-- ocorrem mudanças nas tabelas: appointments, patients, procedures, 
-- patient_records e profiles
-- ============================================================================

-- ============================================================================
-- 1. FUNÇÃO E TRIGGERS PARA APPOINTMENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_notify_appointments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Detectar campos alterados
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
    
    -- Remover vírgula final
    changed_fields := trim(trailing ', ' from changed_fields);
    
    -- Se não houve mudanças relevantes, não notificar
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

  -- Deduplicação: evitar notificações duplicadas nos últimos 3 segundos
  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = target_user
      AND type = notif_type
      AND appointment_id = target_appt
      AND created_at > now() - interval '3 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (title, message, type, appointment_id, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_appt, target_user);

  RETURN NULL;
END;
$$;

-- Criar triggers para appointments
DROP TRIGGER IF EXISTS trg_notify_appointments_insert ON appointments;
CREATE TRIGGER trg_notify_appointments_insert
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

DROP TRIGGER IF EXISTS trg_notify_appointments_update ON appointments;
CREATE TRIGGER trg_notify_appointments_update
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

DROP TRIGGER IF EXISTS trg_notify_appointments_delete ON appointments;
CREATE TRIGGER trg_notify_appointments_delete
  AFTER DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_appointments();

-- ============================================================================
-- 2. FUNÇÃO E TRIGGERS PARA PATIENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_notify_patients()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Deduplicação
  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = target_user
      AND type = notif_type
      AND message = notif_msg
      AND created_at > now() - interval '3 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$$;

-- Criar triggers para patients
DROP TRIGGER IF EXISTS trg_notify_patients_insert ON patients;
CREATE TRIGGER trg_notify_patients_insert
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

DROP TRIGGER IF EXISTS trg_notify_patients_update ON patients;
CREATE TRIGGER trg_notify_patients_update
  AFTER UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

DROP TRIGGER IF EXISTS trg_notify_patients_delete ON patients;
CREATE TRIGGER trg_notify_patients_delete
  AFTER DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patients();

-- ============================================================================
-- 3. FUNÇÃO E TRIGGERS PARA PROCEDURES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_notify_procedures()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Deduplicação
  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = target_user
      AND type = notif_type
      AND message = notif_msg
      AND created_at > now() - interval '3 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$$;

-- Criar triggers para procedures
DROP TRIGGER IF EXISTS trg_notify_procedures_insert ON procedures;
CREATE TRIGGER trg_notify_procedures_insert
  AFTER INSERT ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

DROP TRIGGER IF EXISTS trg_notify_procedures_update ON procedures;
CREATE TRIGGER trg_notify_procedures_update
  AFTER UPDATE ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

DROP TRIGGER IF EXISTS trg_notify_procedures_delete ON procedures;
CREATE TRIGGER trg_notify_procedures_delete
  AFTER DELETE ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_procedures();

-- ============================================================================
-- 4. FUNÇÃO E TRIGGERS PARA PATIENT_RECORDS (PRONTUÁRIOS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_notify_patient_records()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Deduplicação
  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = target_user
      AND type = notif_type
      AND message = notif_msg
      AND created_at > now() - interval '3 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$$;

-- Criar triggers para patient_records
DROP TRIGGER IF EXISTS trg_notify_patient_records_insert ON patient_records;
CREATE TRIGGER trg_notify_patient_records_insert
  AFTER INSERT ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

DROP TRIGGER IF EXISTS trg_notify_patient_records_update ON patient_records;
CREATE TRIGGER trg_notify_patient_records_update
  AFTER UPDATE ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

DROP TRIGGER IF EXISTS trg_notify_patient_records_delete ON patient_records;
CREATE TRIGGER trg_notify_patient_records_delete
  AFTER DELETE ON patient_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_patient_records();

-- ============================================================================
-- 5. FUNÇÃO E TRIGGERS PARA PROFILES (CONFIGURAÇÕES)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_notify_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Deduplicação
  IF EXISTS (
    SELECT 1 FROM notifications
    WHERE user_id = target_user
      AND type = notif_type
      AND created_at > now() - interval '3 seconds'
  ) THEN
    RETURN NULL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (title, message, type, user_id)
  VALUES (notif_title, notif_msg, notif_type, target_user);

  RETURN NULL;
END;
$$;

-- Criar trigger para profiles (apenas UPDATE)
DROP TRIGGER IF EXISTS trg_notify_profiles_update ON profiles;
CREATE TRIGGER trg_notify_profiles_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_profiles();
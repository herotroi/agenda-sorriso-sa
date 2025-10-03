-- Fix coupon RLS policy to require authentication
DROP POLICY IF EXISTS "Anyone can view active coupons" ON cupons;

CREATE POLICY "Authenticated users can view active coupons" 
ON cupons 
FOR SELECT 
TO authenticated
USING (ativo = true AND auth.uid() IS NOT NULL);

-- Fix storage bucket RLS policies for documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix storage bucket RLS policies for company-assets
CREATE POLICY "Users can view their own company assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own company assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own company assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own company assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix SECURITY DEFINER functions by setting fixed search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cupons_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_usage_stats(p_user_id uuid)
RETURNS TABLE(appointments_count integer, patients_count integer, professionals_count integer, procedures_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM appointments WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM patients WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM professionals WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM procedures WHERE user_id = p_user_id AND active = true);
END;
$function$;
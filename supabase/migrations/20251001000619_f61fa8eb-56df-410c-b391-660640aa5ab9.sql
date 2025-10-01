-- Fix RLS policies for settings table to prevent unauthorized access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable all operations for settings" ON public.settings;

-- Allow authenticated users to read settings (needed for app functionality)
CREATE POLICY "Authenticated users can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (true);

-- Block all write operations from regular users
-- Only service role (backend/admin) can insert settings
CREATE POLICY "Only service role can insert settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Only service role can update settings
CREATE POLICY "Only service role can update settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (false);

-- Only service role can delete settings
CREATE POLICY "Only service role can delete settings"
ON public.settings
FOR DELETE
TO authenticated
USING (false);
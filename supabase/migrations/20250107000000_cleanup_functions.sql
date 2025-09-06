-- Clean up functions and their dependencies
-- Migration: 20250107000000_cleanup_functions.sql

-- First, drop any triggers that depend on the chat support functions
DROP TRIGGER IF EXISTS sync_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Drop only the chat support related functions
DROP FUNCTION IF EXISTS sync_user_profile();

-- Drop the user_profiles table if it exists (since we removed chat support)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Now fix the user_roles RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON public.user_roles;

-- Create simple policies for user_roles
CREATE POLICY "Users can read own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Note: update_updated_at_column function is kept as it's used by many tables

-- Ensure the handle_new_user function works properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert user role (default to customer)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

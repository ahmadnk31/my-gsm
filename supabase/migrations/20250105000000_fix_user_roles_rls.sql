-- Fix user_roles RLS policies to allow login
-- Migration: 20250105000000_fix_user_roles_rls.sql

-- Drop the problematic policy that uses has_role function
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a simpler policy that allows users to read their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also fix the admin policy to be simpler
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a policy that allows admins to manage all roles
-- This will work once the user is authenticated and has admin role
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

-- Ensure the handle_new_user function works properly
-- This function should be called when a new user signs up
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

-- Insert a default admin user if none exists
-- This will help with initial setup
INSERT INTO public.user_roles (user_id, role)
SELECT 
  au.id,
  'admin'
FROM auth.users au
WHERE au.email = 'admin@phonehub.com' -- Change this to your admin email
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = au.id AND ur.role = 'admin'
  )
ON CONFLICT (user_id, role) DO NOTHING;

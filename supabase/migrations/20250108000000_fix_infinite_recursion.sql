-- Fix infinite recursion in user_roles RLS policies
-- Migration: 20250108000000_fix_infinite_recursion.sql

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a simpler approach: allow all authenticated users to read roles
-- and use application-level admin checks instead of database-level
CREATE POLICY "Allow authenticated users to read roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- For now, we'll handle admin permissions at the application level
-- This prevents the infinite recursion issue

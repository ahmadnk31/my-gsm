-- Fix Banner Management RLS Policies
-- Run this to update the existing policies to use the correct user_roles table

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Admin can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can delete banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.banners;

-- Create corrected policies that reference the user_roles table
CREATE POLICY "Admin can insert banners" ON public.banners
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update banners" ON public.banners
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete banners" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'banners';

-- Test if current user can manage banners (should show true for admin users)
SELECT 
    auth.uid() as current_user_id,
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) as is_admin;

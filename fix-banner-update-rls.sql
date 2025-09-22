-- Fix RLS policies for banner updates
-- This script fixes the issue where banner updates are blocked by RLS policies

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can read active banners" ON public.banners;
DROP POLICY IF EXISTS "Public can read active banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can read all banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can delete banners" ON public.banners;

-- Recreate policies with proper permissions
-- Public users can read active banners (for homepage display)
CREATE POLICY "Public can read active banners" ON public.banners
    FOR SELECT USING (
        is_active = true 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Admin users can read all banners (for management interface)
CREATE POLICY "Admin can read all banners" ON public.banners
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin users can insert banners
CREATE POLICY "Admin can insert banners" ON public.banners
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin users can update banners (WITH CHECK clause is crucial!)
CREATE POLICY "Admin can update banners" ON public.banners
    FOR UPDATE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admin users can delete banners
CREATE POLICY "Admin can delete banners" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Verify the policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'banners' 
ORDER BY cmd, policyname;

-- Test query to check if admin user exists (replace with your actual user ID)
-- SELECT user_id, role FROM public.user_roles WHERE role = 'admin';

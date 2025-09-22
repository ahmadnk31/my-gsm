-- Fix RLS policies for banner management
-- This allows admins to read ALL banners (both active and inactive) for management purposes

-- Add policy for admins to read all banners (including inactive ones)
CREATE POLICY "Admin can read all banners" ON public.banners
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Drop the existing restrictive read policy if it conflicts
-- DROP POLICY IF EXISTS "Anyone can read active banners" ON public.banners;

-- Recreate the public read policy to be more specific
DROP POLICY IF EXISTS "Anyone can read active banners" ON public.banners;
CREATE POLICY "Public can read active banners" ON public.banners
    FOR SELECT USING (
        is_active = true 
        AND (
            start_date IS NULL OR start_date <= NOW()
        )
        AND (
            end_date IS NULL OR end_date >= NOW()
        )
    );

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'banners' 
ORDER BY policyname;

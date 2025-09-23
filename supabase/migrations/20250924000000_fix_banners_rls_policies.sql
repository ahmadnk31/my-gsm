-- Fix banners RLS policies to be more permissive for development
-- This migration updates the existing policies to allow authenticated users to manage banners

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can delete banners" ON public.banners;
DROP POLICY IF EXISTS "Authenticated users can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Authenticated users can update banners" ON public.banners;
DROP POLICY IF EXISTS "Service role can manage all banners" ON public.banners;

-- Create more permissive policies for authenticated users
-- Allow any authenticated user to insert banners (useful for seeding/development)
CREATE POLICY "Authenticated users can insert banners" ON public.banners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to update banners
CREATE POLICY "Authenticated users can update banners" ON public.banners
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Admin users can still delete banners (keep this restrictive)
CREATE POLICY "Admin can delete banners" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
            
        )
    );

-- Alternative: Create a policy that allows service role to bypass RLS for banner management
-- This is useful for server-side operations and seeding
CREATE POLICY "Service role can manage all banners" ON public.banners
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Grant additional permissions to ensure smooth operation
GRANT ALL ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

-- Create a function to safely insert default banners (bypasses RLS)
CREATE OR REPLACE FUNCTION public.ensure_default_banners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create default banners if none exist
    IF NOT EXISTS (SELECT 1 FROM public.banners LIMIT 1) THEN
        INSERT INTO public.banners (type, title, subtitle, description, button_text, button_link, background_color, text_color, priority, is_active) VALUES
        (
            'promotion',
            '50% OFF Screen Repairs',
            'Limited Time Offer',
            'Professional screen replacement for all major phone brands. Book now and save big!',
            'Book Repair',
            '/repairs',
            'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
            'text-white',
            1,
            true
        ),
        (
            'feature',
            'Premium Phone Accessories',
            'Latest Collection',
            'High-quality cases, chargers, and screen protectors for all major brands.',
            'Shop Now',
            '/accessories',
            'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600',
            'text-white',
            2,
            true
        ),
        (
            'announcement',
            'Extended Warranty Available',
            'Peace of Mind Guaranteed',
            '6-month warranty on all repair services. Professional quality guaranteed.',
            'Learn More',
            '/repairs',
            'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600',
            'text-white',
            3,
            true
        ),
        (
            'seasonal',
            'Professional Mobile Solutions',
            'Your Trusted Partner',
            'Expert repairs and premium accessories. Quality service you can rely on.',
            'Get Started',
            '/repairs',
            'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600',
            'text-white',
            4,
            true
        );
    END IF;
END;
$$;

-- Execute the function to ensure default banners exist
SELECT public.ensure_default_banners();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.ensure_default_banners() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_default_banners() TO anon;

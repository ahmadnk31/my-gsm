-- Banner Management Table Setup
-- Run this SQL in your Supabase SQL Editor if the migration hasn't been applied

-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('promotion', 'announcement', 'feature', 'seasonal')),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    button_text TEXT,
    button_link TEXT,
    image_url TEXT,
    background_color TEXT NOT NULL DEFAULT 'bg-gradient-to-r from-blue-500 to-purple-600',
    text_color TEXT NOT NULL DEFAULT 'text-white',
    priority INTEGER NOT NULL DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_priority_active 
ON public.banners (priority ASC, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_banners_dates 
ON public.banners (start_date, end_date) 
WHERE start_date IS NOT NULL OR end_date IS NOT NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS banners_updated_at_trigger ON public.banners;
CREATE TRIGGER banners_updated_at_trigger
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION public.banners_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.banners;

-- Create RLS policies
-- Policy for public to read active banners
CREATE POLICY "Public can read active banners" ON public.banners
    FOR SELECT 
    USING (is_active = true);

-- Policy for admins to manage all banners
CREATE POLICY "Admins can manage all banners" ON public.banners
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- Insert sample banners for testing
INSERT INTO public.banners (type, title, subtitle, description, button_text, button_link, background_color, text_color, priority, is_active)
VALUES 
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
        'New iPhone 15 Accessories',
        'Just Arrived',
        'Premium cases, wireless chargers, and screen protectors for the latest iPhone.',
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
        'Peace of Mind',
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
        'Holiday Special Deals',
        'Gift Your Loved Ones',
        'Premium phone accessories at unbeatable prices. Perfect gifts for tech lovers!',
        'Explore Gifts',
        '/accessories',
        'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600',
        'text-white',
        4,
        true
    )
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 
    'Setup Complete!' as status,
    COUNT(*) as sample_banners_created
FROM public.banners;

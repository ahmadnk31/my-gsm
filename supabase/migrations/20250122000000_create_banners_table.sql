-- Create banners table for dynamic homepage banners
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

-- Create an index on priority and is_active for efficient querying
CREATE INDEX IF NOT EXISTS idx_banners_priority_active ON public.banners (priority, is_active);

-- Create an index on date range for time-based banner filtering
CREATE INDEX IF NOT EXISTS idx_banners_dates ON public.banners (start_date, end_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default banners
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
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Everyone can read active banners (for public display)
CREATE POLICY "Public can read active banners" ON public.banners
    FOR SELECT USING (
        is_active = true 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Admin users can read all banners (for management)
CREATE POLICY "Admin can read all banners" ON public.banners
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only authenticated users with admin role can insert banners
CREATE POLICY "Admin can insert banners" ON public.banners
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only authenticated users with admin role can update banners
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

-- Only authenticated users with admin role can delete banners
CREATE POLICY "Admin can delete banners" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON public.banners TO authenticated;
GRANT SELECT ON public.banners TO anon;

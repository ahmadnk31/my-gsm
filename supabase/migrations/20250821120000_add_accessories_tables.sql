-- Create accessories tables
CREATE TABLE IF NOT EXISTS public.accessory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.accessory_brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.accessories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.accessory_categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.accessory_brands(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    sku TEXT UNIQUE,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    compatibility JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    weight_grams INTEGER,
    dimensions JSONB DEFAULT '{}'::jsonb,
    warranty_months INTEGER,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.accessory_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    accessory_id UUID NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(accessory_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    accessory_id UUID NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, accessory_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    accessory_id UUID NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, accessory_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accessories_category_id ON public.accessories(category_id);
CREATE INDEX IF NOT EXISTS idx_accessories_brand_id ON public.accessories(brand_id);
CREATE INDEX IF NOT EXISTS idx_accessories_price ON public.accessories(price);
CREATE INDEX IF NOT EXISTS idx_accessories_is_featured ON public.accessories(is_featured);
CREATE INDEX IF NOT EXISTS idx_accessories_is_active ON public.accessories(is_active);
CREATE INDEX IF NOT EXISTS idx_accessories_rating ON public.accessories(rating);
CREATE INDEX IF NOT EXISTS idx_accessory_reviews_accessory_id ON public.accessory_reviews(accessory_id);
CREATE INDEX IF NOT EXISTS idx_accessory_reviews_user_id ON public.accessory_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- Enable RLS
ALTER TABLE public.accessory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Accessory categories (public read, admin write)
CREATE POLICY "Anyone can read accessory categories" ON public.accessory_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage accessory categories" ON public.accessory_categories
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin'::app_role)
    );

-- Accessory brands (public read, admin write)
CREATE POLICY "Anyone can read accessory brands" ON public.accessory_brands
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage accessory brands" ON public.accessory_brands
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin'::app_role)
    );

-- Accessories (public read active items, admin manage all)
CREATE POLICY "Anyone can read active accessories" ON public.accessories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all accessories" ON public.accessories
    FOR SELECT USING (
        public.has_role(auth.uid(), 'admin'::app_role)
    );

CREATE POLICY "Admins can manage accessories" ON public.accessories
    FOR ALL USING (
        public.has_role(auth.uid(), 'admin'::app_role)
    );

-- Accessory reviews (users can CRUD their own, public read)
CREATE POLICY "Anyone can read accessory reviews" ON public.accessory_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reviews" ON public.accessory_reviews
    FOR ALL USING (user_id = auth.uid());

-- Wishlist items (users can CRUD their own)
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist_items
    FOR ALL USING (user_id = auth.uid());

-- Cart items (users can CRUD their own)
CREATE POLICY "Users can manage their own cart" ON public.cart_items
    FOR ALL USING (user_id = auth.uid());

-- Insert sample data
INSERT INTO public.accessory_categories (name, description, icon) VALUES
('cases', 'Protective cases and covers', 'Shield'),
('protection', 'Screen protectors and privacy films', 'Shield'),
('chargers', 'Wireless and wired chargers', 'Zap'),
('cables', 'Charging and data cables', 'Cable'),
('audio', 'Headphones, earbuds, and speakers', 'Headphones'),
('power', 'Power banks and portable batteries', 'Battery'),
('mounts', 'Car mounts, stands, and holders', 'Laptop'),
('smartwatch', 'Smartwatch accessories', 'Watch'),
('camera', 'Camera accessories and lenses', 'Camera'),
('gaming', 'Gaming controllers and accessories', 'Gamepad2')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.accessory_brands (name, description) VALUES
('TechPro', 'Premium technology accessories'),
('GuardTech', 'Protection specialists'),
('ArmorShield', 'Military-grade protection'),
('SoundMax', 'High-quality audio equipment'),
('PowerLink', 'Charging solutions'),
('EnergyMax', 'Portable power solutions')
ON CONFLICT (name) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_accessory_categories_updated_at BEFORE UPDATE ON public.accessory_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessory_brands_updated_at BEFORE UPDATE ON public.accessory_brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessories_updated_at BEFORE UPDATE ON public.accessories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessory_reviews_updated_at BEFORE UPDATE ON public.accessory_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for accessory images
INSERT INTO storage.buckets (id, name, public) VALUES ('accessory-images', 'accessory-images', true);

-- Create storage policies for accessory images
CREATE POLICY "Anyone can view accessory images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'accessory-images');

CREATE POLICY "Admins can upload accessory images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'accessory-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update accessory images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'accessory-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete accessory images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'accessory-images' AND public.has_role(auth.uid(), 'admin'::app_role));

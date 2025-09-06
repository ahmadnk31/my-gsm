-- Create device categories table
CREATE TABLE public.device_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device brands table
CREATE TABLE public.device_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.device_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Create device models table
CREATE TABLE public.device_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.device_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  release_year INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id, name)
);

-- Create device parts table
CREATE TABLE public.device_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- screen, battery, camera, speaker, etc.
  image_url TEXT,
  estimated_duration TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  warranty_period TEXT DEFAULT '1 year',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(model_id, name, category)
);

-- Create part pricing table for different quality versions
CREATE TABLE public.part_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL REFERENCES public.device_parts(id) ON DELETE CASCADE,
  quality_type TEXT NOT NULL CHECK (quality_type IN ('original', 'oem', 'aftermarket', 'refurbished')),
  quality_description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  labor_cost NUMERIC DEFAULT 0 CHECK (labor_cost >= 0),
  total_cost NUMERIC GENERATED ALWAYS AS (price + labor_cost) STORED,
  supplier TEXT,
  availability_status TEXT DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(part_id, quality_type)
);

-- Enable Row Level Security
ALTER TABLE public.device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_pricing ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Anyone can view active device categories" 
ON public.device_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active device brands" 
ON public.device_brands 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active device models" 
ON public.device_models 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active device parts" 
ON public.device_parts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view active part pricing" 
ON public.part_pricing 
FOR SELECT 
USING (is_active = true);

-- Create admin management policies
CREATE POLICY "Admins can manage device categories" 
ON public.device_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage device brands" 
ON public.device_brands 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage device models" 
ON public.device_models 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage device parts" 
ON public.device_parts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage part pricing" 
ON public.part_pricing 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create update timestamp triggers
CREATE TRIGGER update_device_categories_updated_at
BEFORE UPDATE ON public.device_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_brands_updated_at
BEFORE UPDATE ON public.device_brands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_models_updated_at
BEFORE UPDATE ON public.device_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_parts_updated_at
BEFORE UPDATE ON public.device_parts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_part_pricing_updated_at
BEFORE UPDATE ON public.part_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_device_brands_category_id ON public.device_brands(category_id);
CREATE INDEX idx_device_models_brand_id ON public.device_models(brand_id);
CREATE INDEX idx_device_parts_model_id ON public.device_parts(model_id);
CREATE INDEX idx_device_parts_category ON public.device_parts(category);
CREATE INDEX idx_part_pricing_part_id ON public.part_pricing(part_id);
CREATE INDEX idx_part_pricing_quality_type ON public.part_pricing(quality_type);

-- Update bookings table to reference the new structure
ALTER TABLE public.bookings 
ADD COLUMN part_id UUID REFERENCES public.device_parts(id),
ADD COLUMN selected_quality_type TEXT,
ADD COLUMN quoted_price NUMERIC;

-- Insert sample data for testing
INSERT INTO public.device_categories (name, description, icon_name, display_order) VALUES
('Smartphones', 'Mobile phones and smartphones', 'Smartphone', 1),
('Tablets', 'Tablets and iPads', 'Tablet', 2),
('Laptops', 'Laptops and notebooks', 'Laptop', 3),
('Smartwatches', 'Smart watches and wearables', 'Watch', 4);

INSERT INTO public.device_brands (category_id, name, description, display_order) 
SELECT 
  c.id,
  brand.name,
  brand.description,
  brand.display_order
FROM public.device_categories c
CROSS JOIN (VALUES 
  ('Apple', 'Premium smartphones and devices', 1),
  ('Samsung', 'Android smartphones and tablets', 2),
  ('Google', 'Pixel smartphones', 3),
  ('OnePlus', 'Flagship Android devices', 4),
  ('Xiaomi', 'Value smartphones', 5),
  ('Huawei', 'Android smartphones', 6)
) AS brand(name, description, display_order)
WHERE c.name = 'Smartphones';

-- Insert sample models for iPhone
INSERT INTO public.device_models (brand_id, name, description, release_year, display_order)
SELECT 
  b.id,
  model.name,
  model.description,
  model.release_year,
  model.display_order
FROM public.device_brands b
CROSS JOIN (VALUES 
  ('iPhone 15 Pro Max', 'Latest flagship iPhone', 2023, 1),
  ('iPhone 15 Pro', 'Flagship iPhone with titanium build', 2023, 2),
  ('iPhone 15', 'Standard iPhone with USB-C', 2023, 3),
  ('iPhone 14 Pro Max', 'Previous generation flagship', 2022, 4),
  ('iPhone 14 Pro', 'Previous generation Pro model', 2022, 5),
  ('iPhone 14', 'Previous generation standard model', 2022, 6),
  ('iPhone 13', 'Popular mid-range iPhone', 2021, 7),
  ('iPhone 12', 'Older generation iPhone', 2020, 8)
) AS model(name, description, release_year, display_order)
WHERE b.name = 'Apple';

-- Insert sample models for Samsung
INSERT INTO public.device_models (brand_id, name, description, release_year, display_order)
SELECT 
  b.id,
  model.name,
  model.description,
  model.release_year,
  model.display_order
FROM public.device_brands b
CROSS JOIN (VALUES 
  ('Galaxy S24 Ultra', 'Latest flagship Samsung phone', 2024, 1),
  ('Galaxy S24+', 'Large screen Galaxy S24', 2024, 2),
  ('Galaxy S24', 'Standard Galaxy S24', 2024, 3),
  ('Galaxy S23 Ultra', 'Previous generation Ultra', 2023, 4),
  ('Galaxy S23', 'Previous generation standard', 2023, 5),
  ('Galaxy A54', 'Mid-range Galaxy phone', 2023, 6)
) AS model(name, description, release_year, display_order)
WHERE b.name = 'Samsung';

-- Insert sample parts for iPhone models
INSERT INTO public.device_parts (model_id, name, description, category, estimated_duration, difficulty_level)
SELECT 
  m.id,
  part.name,
  part.description,
  part.category,
  part.estimated_duration,
  part.difficulty_level
FROM public.device_models m
CROSS JOIN (VALUES 
  ('Screen Assembly', 'Complete screen with touch and LCD/OLED', 'screen', '45-60 minutes', 'medium'),
  ('Battery', 'Lithium-ion battery replacement', 'battery', '30-45 minutes', 'easy'),
  ('Rear Camera', 'Main camera module replacement', 'camera', '60-90 minutes', 'hard'),
  ('Front Camera', 'Selfie camera and Face ID sensors', 'camera', '45-60 minutes', 'medium'),
  ('Charging Port', 'Lightning/USB-C charging port assembly', 'port', '60-90 minutes', 'medium'),
  ('Speaker', 'Bottom speaker assembly', 'audio', '30-45 minutes', 'easy'),
  ('Earpiece Speaker', 'Top speaker for calls', 'audio', '45-60 minutes', 'medium'),
  ('Back Glass', 'Rear glass panel replacement', 'cosmetic', '90-120 minutes', 'hard')
) AS part(name, description, category, estimated_duration, difficulty_level)
WHERE m.name LIKE 'iPhone%';

-- Insert sample pricing for parts
INSERT INTO public.part_pricing (part_id, quality_type, quality_description, price, labor_cost, supplier, availability_status)
SELECT 
  p.id,
  pricing.quality_type,
  pricing.quality_description,
  pricing.price,
  pricing.labor_cost,
  pricing.supplier,
  pricing.availability_status
FROM public.device_parts p
CROSS JOIN (VALUES 
  ('original', 'Genuine Apple OEM parts', 150.00, 50.00, 'Apple', 'in_stock'),
  ('oem', 'OEM quality aftermarket parts', 80.00, 50.00, 'Foxconn', 'in_stock'),
  ('aftermarket', 'High quality aftermarket parts', 45.00, 50.00, 'Third Party', 'in_stock')
) AS pricing(quality_type, quality_description, price, labor_cost, supplier, availability_status)
WHERE p.category = 'screen';

-- Insert sample pricing for parts
INSERT INTO public.part_pricing (part_id, quality_type, quality_description, price, labor_cost, supplier, availability_status)
SELECT 
  p.id,
  pricing.quality_type,
  pricing.quality_description,
  pricing.price,
  pricing.labor_cost,
  pricing.supplier,
  pricing.availability_status
FROM public.device_parts p
CROSS JOIN (VALUES 
  ('original', 'Genuine Apple battery', 60.00, 30.00, 'Apple', 'in_stock'),
  ('oem', 'OEM quality battery', 35.00, 30.00, 'OEM Supplier', 'in_stock'),
  ('aftermarket', 'Compatible battery', 25.00, 30.00, 'Third Party', 'in_stock')
) AS pricing(quality_type, quality_description, price, labor_cost, supplier, availability_status)
WHERE p.category = 'battery';

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('device-images', 'device-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('model-images', 'model-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('part-images', 'part-images', true);

-- Create policies for device images
CREATE POLICY "Anyone can view device images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'device-images');

CREATE POLICY "Admins can upload device images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'device-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update device images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'device-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete device images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'device-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create policies for brand logos
CREATE POLICY "Anyone can view brand logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'brand-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brand logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'brand-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brand logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'brand-logos' AND has_role(auth.uid(), 'admin'::app_role));

-- Create policies for model images
CREATE POLICY "Anyone can view model images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'model-images');

CREATE POLICY "Admins can upload model images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update model images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete model images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'model-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create policies for part images
CREATE POLICY "Anyone can view part images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'part-images');

CREATE POLICY "Admins can upload part images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'part-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update part images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'part-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete part images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'part-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Add slug columns to device tables for better URL navigation
ALTER TABLE public.device_categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE public.device_brands 
ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique constraints for slugs within their respective scopes
ALTER TABLE public.device_brands 
ADD CONSTRAINT IF NOT EXISTS unique_brand_slug_per_category 
UNIQUE (category_id, slug);

ALTER TABLE public.device_models 
ADD CONSTRAINT IF NOT EXISTS unique_model_slug_per_brand 
UNIQUE (brand_id, slug);

-- Create indexes for slug lookups
CREATE INDEX IF NOT EXISTS idx_device_categories_slug ON public.device_categories(slug);
CREATE INDEX IF NOT EXISTS idx_device_brands_slug ON public.device_brands(slug);
CREATE INDEX IF NOT EXISTS idx_device_models_slug ON public.device_models(slug);

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique slug for categories
CREATE OR REPLACE FUNCTION generate_unique_category_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.device_categories WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug for brands within a category
CREATE OR REPLACE FUNCTION generate_unique_brand_slug(input_text TEXT, p_category_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.device_brands WHERE slug = final_slug AND category_id = p_category_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug for models within a brand
CREATE OR REPLACE FUNCTION generate_unique_model_slug(input_text TEXT, p_brand_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.device_models WHERE slug = final_slug AND brand_id = p_brand_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with unique slugs
UPDATE public.device_categories 
SET slug = generate_unique_category_slug(name)
WHERE slug IS NULL;

UPDATE public.device_brands 
SET slug = generate_unique_brand_slug(name, category_id)
WHERE slug IS NULL;

UPDATE public.device_models 
SET slug = generate_unique_model_slug(name, brand_id)
WHERE slug IS NULL;

-- Make slug columns NOT NULL after populating them
ALTER TABLE public.device_categories 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.device_brands 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.device_models 
ALTER COLUMN slug SET NOT NULL;

-- Create trigger to automatically generate unique slugs on insert/update
CREATE OR REPLACE FUNCTION update_category_slug_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_category_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_brand_slug_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_brand_slug(NEW.name, NEW.category_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_model_slug_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_model_slug(NEW.name, NEW.brand_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic slug generation
DROP TRIGGER IF EXISTS update_device_categories_slug ON public.device_categories;
CREATE TRIGGER update_device_categories_slug
  BEFORE INSERT OR UPDATE ON public.device_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_slug_column();

DROP TRIGGER IF EXISTS update_device_brands_slug ON public.device_brands;
CREATE TRIGGER update_device_brands_slug
  BEFORE INSERT OR UPDATE ON public.device_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_slug_column();

DROP TRIGGER IF EXISTS update_device_models_slug ON public.device_models;
CREATE TRIGGER update_device_models_slug
  BEFORE INSERT OR UPDATE ON public.device_models
  FOR EACH ROW
  EXECUTE FUNCTION update_model_slug_column();

-- Add slug columns to accessories tables for SEO-friendly URLs
ALTER TABLE public.accessory_categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

ALTER TABLE public.accessories 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique constraint for accessory slugs within their category
ALTER TABLE public.accessories 
ADD CONSTRAINT IF NOT EXISTS unique_accessory_slug_per_category 
UNIQUE (category_id, slug);

-- Create indexes for slug lookups
CREATE INDEX IF NOT EXISTS idx_accessory_categories_slug ON public.accessory_categories(slug);
CREATE INDEX IF NOT EXISTS idx_accessories_slug ON public.accessories(slug);

-- Function to generate unique slug for accessory categories
CREATE OR REPLACE FUNCTION generate_unique_accessory_category_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.accessory_categories WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug for accessories within a category
CREATE OR REPLACE FUNCTION generate_unique_accessory_slug(input_text TEXT, p_category_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(input_text);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.accessories WHERE slug = final_slug AND category_id = p_category_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing accessory categories with slugs
UPDATE public.accessory_categories 
SET slug = generate_unique_accessory_category_slug(name)
WHERE slug IS NULL;

-- Update existing accessories with slugs
UPDATE public.accessories 
SET slug = generate_unique_accessory_slug(name, category_id)
WHERE slug IS NULL;

-- Make slug columns NOT NULL after populating
ALTER TABLE public.accessory_categories 
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.accessories 
ALTER COLUMN slug SET NOT NULL;

-- Create trigger functions to automatically generate slugs
CREATE OR REPLACE FUNCTION update_accessory_category_slug_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_accessory_category_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_accessory_slug_column()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_accessory_slug(NEW.name, NEW.category_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically generate slugs on insert/update
CREATE TRIGGER update_accessory_categories_slug
  BEFORE INSERT OR UPDATE ON public.accessory_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_accessory_category_slug_column();

CREATE TRIGGER update_accessories_slug
  BEFORE INSERT OR UPDATE ON public.accessories
  FOR EACH ROW
  EXECUTE FUNCTION update_accessory_slug_column();

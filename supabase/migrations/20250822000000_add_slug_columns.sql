/* -------------------------------------------------
   1️⃣ Add slug columns
   ------------------------------------------------- */
ALTER TABLE public.device_categories 
  ADD COLUMN slug TEXT UNIQUE;

ALTER TABLE public.device_brands 
  ADD COLUMN slug TEXT;

ALTER TABLE public.device_models 
  ADD COLUMN slug TEXT;


/* -------------------------------------------------
   2️⃣ Unique constraints (slug scoped per parent)
   ------------------------------------------------- */
ALTER TABLE public.device_brands 
  ADD CONSTRAINT unique_brand_slug_per_category 
  UNIQUE (category_id, slug);

ALTER TABLE public.device_models 
  ADD CONSTRAINT unique_model_slug_per_brand 
  UNIQUE (brand_id, slug);


/* -------------------------------------------------
   3️⃣ Indexes for fast look‑ups
   ------------------------------------------------- */
CREATE INDEX idx_device_categories_slug ON public.device_categories(slug);
CREATE INDEX idx_device_brands_slug ON public.device_brands(slug);
CREATE INDEX idx_device_models_slug ON public.device_models(slug);


/* -------------------------------------------------
   4️⃣ Helper: generic slug generator
   ------------------------------------------------- */
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\\s-]', '', 'g'),
        '\\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;


/* -------------------------------------------------
   5️⃣ Unique slug for a **category**
   ------------------------------------------------- */
CREATE OR REPLACE FUNCTION generate_unique_category_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug   TEXT;
  final_slug  TEXT;
  counter     INTEGER := 0;
BEGIN
  base_slug  := generate_slug(input_text);
  final_slug := base_slug;

  WHILE EXISTS (
        SELECT 1
        FROM   public.device_categories dc
        WHERE  dc.slug = final_slug
      ) LOOP
    counter     := counter + 1;
    final_slug  := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;


/* -------------------------------------------------
   6️⃣ Unique slug for a **brand** (scoped by category)
   ------------------------------------------------- */
CREATE OR REPLACE FUNCTION generate_unique_brand_slug(input_text TEXT, p_category_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug   TEXT;
  final_slug  TEXT;
  counter     INTEGER := 0;
BEGIN
  base_slug  := generate_slug(input_text);
  final_slug := base_slug;

  WHILE EXISTS (
        SELECT 1
        FROM   public.device_brands db
        WHERE  db.slug = final_slug
          AND  db.category_id = p_category_id
      ) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;


/* -------------------------------------------------
   7️⃣ Unique slug for a **model** (scoped by brand)
   ------------------------------------------------- */
CREATE OR REPLACE FUNCTION generate_unique_model_slug(input_text TEXT, p_brand_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug   TEXT;
  final_slug  TEXT;
  counter     INTEGER := 0;
BEGIN
  base_slug  := generate_slug(input_text);
  final_slug := base_slug;

  WHILE EXISTS (
        SELECT 1
        FROM   public.device_models dm
        WHERE  dm.slug = final_slug
          AND  dm.brand_id = p_brand_id
      ) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;


/* -------------------------------------------------
   8️⃣ Populate existing rows with unique slugs
   ------------------------------------------------- */
UPDATE public.device_categories dc
SET    slug = generate_unique_category_slug(dc.name)
WHERE  dc.slug IS NULL;

UPDATE public.device_brands db
SET    slug = generate_unique_brand_slug(db.name, db.category_id)
WHERE  db.slug IS NULL;

UPDATE public.device_models dm
SET    slug = generate_unique_model_slug(dm.name, dm.brand_id)
WHERE  dm.slug IS NULL;


/* -------------------------------------------------
   9️⃣ Make slug columns NOT NULL (after back‑fill)
   ------------------------------------------------- */
ALTER TABLE public.device_categories
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.device_brands
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.device_models
  ALTER COLUMN slug SET NOT NULL;


/* -------------------------------------------------
   10️⃣ Triggers – auto‑generate slugs on INSERT/UPDATE
   ------------------------------------------------- */
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

CREATE TRIGGER update_device_categories_slug
BEFORE INSERT OR UPDATE ON public.device_categories
FOR EACH ROW EXECUTE FUNCTION update_category_slug_column();

CREATE TRIGGER update_device_brands_slug
BEFORE INSERT OR UPDATE ON public.device_brands
FOR EACH ROW EXECUTE FUNCTION update_brand_slug_column();

CREATE TRIGGER update_device_models_slug
BEFORE INSERT OR UPDATE ON public.device_models
FOR EACH ROW EXECUTE FUNCTION update_model_slug_column();
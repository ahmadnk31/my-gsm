-- Add part versions support to repair_items
ALTER TABLE public.repair_items 
ADD COLUMN part_versions JSONB DEFAULT '[]'::jsonb;

-- Update the part_versions column to store version data like:
-- [
--   {
--     "name": "Screen Assembly",
--     "versions": [
--       {"type": "original", "price": 150, "quality": "OEM"},
--       {"type": "copy", "price": 80, "quality": "Aftermarket"}
--     ]
--   }
-- ]

-- Add an index for better performance on part_versions queries
CREATE INDEX idx_repair_items_part_versions ON public.repair_items USING GIN (part_versions);
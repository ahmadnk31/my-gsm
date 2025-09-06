-- Create repair_items table for managing custom repair offerings
CREATE TABLE public.repair_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  device_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  parts_required TEXT[] NOT NULL DEFAULT '{}',
  estimated_price NUMERIC,
  estimated_duration TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.repair_items ENABLE ROW LEVEL SECURITY;

-- Create policies for repair items
CREATE POLICY "Anyone can view active repair items" 
ON public.repair_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all repair items" 
ON public.repair_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_repair_items_updated_at
BEFORE UPDATE ON public.repair_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for repair item images
INSERT INTO storage.buckets (id, name, public) VALUES ('repair-images', 'repair-images', true);

-- Create policies for repair images
CREATE POLICY "Anyone can view repair images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'repair-images');

CREATE POLICY "Admins can upload repair images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'repair-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update repair images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'repair-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete repair images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'repair-images' AND has_role(auth.uid(), 'admin'::app_role));
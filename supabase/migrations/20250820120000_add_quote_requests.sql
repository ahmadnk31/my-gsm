-- Create quote_requests table
CREATE TABLE quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_category_id UUID REFERENCES device_categories(id),
  device_brand_id UUID REFERENCES device_brands(id),
  device_model_id UUID REFERENCES device_models(id),
  device_part_id UUID REFERENCES device_parts(id),
  custom_device_info TEXT,
  issue_description TEXT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  quoted_price NUMERIC,
  quote_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'declined', 'expired')),
  admin_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for quote_requests
CREATE POLICY "Users can view their own quote requests" 
  ON quote_requests FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quote requests" 
  ON quote_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote requests" 
  ON quote_requests FOR UPDATE 
  USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all quote requests" 
  ON quote_requests FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_quote_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_requests_updated_at();

-- Add quote_request_id to bookings table for linking
ALTER TABLE bookings ADD COLUMN quote_request_id UUID REFERENCES quote_requests(id);

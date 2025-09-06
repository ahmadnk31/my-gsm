-- Create trade-in system tables
-- Migration: 20250101000000_create_trade_in_system.sql

-- Trade-in phone models table
CREATE TABLE IF NOT EXISTS trade_in_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200) NOT NULL,
    storage_options JSONB NOT NULL DEFAULT '[]',
    release_date DATE NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    base_trade_in_value DECIMAL(10,2) NOT NULL,
    market_demand DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    supply_level DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    seasonal_factor DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    competitor_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique brand-model combinations
    UNIQUE(brand, model)
);

-- Trade-in requests table
CREATE TABLE IF NOT EXISTS trade_in_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES trade_in_models(id) ON DELETE CASCADE,
    storage_capacity VARCHAR(50) NOT NULL,
    device_condition VARCHAR(50) NOT NULL,
    estimated_value DECIMAL(10,2) NOT NULL,
    final_value DECIMAL(10,2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Customer information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    device_description TEXT,
    
    -- Additional details
    device_photos JSONB DEFAULT '[]',
    serial_number VARCHAR(100),
    imei VARCHAR(100),
    
    -- Processing details
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade-in pricing history table
CREATE TABLE IF NOT EXISTS trade_in_pricing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES trade_in_models(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    market_demand DECIMAL(3,2) NOT NULL,
    supply_level DECIMAL(3,2) NOT NULL,
    seasonal_factor DECIMAL(3,2) NOT NULL,
    competitor_price DECIMAL(10,2) NOT NULL,
    calculated_value DECIMAL(10,2) NOT NULL,
    market_conditions JSONB NOT NULL DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market conditions table for tracking real-time data
CREATE TABLE IF NOT EXISTS market_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condition_type VARCHAR(100) NOT NULL, -- 'seasonal', 'demand', 'supply', 'competitor'
    condition_value DECIMAL(5,2) NOT NULL,
    affected_models JSONB DEFAULT '[]', -- Array of model IDs this affects
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trade_in_models_brand ON trade_in_models(brand);
CREATE INDEX IF NOT EXISTS idx_trade_in_models_active ON trade_in_models(is_active);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_status ON trade_in_requests(status);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_user ON trade_in_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_in_requests_model ON trade_in_requests(model_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_model ON trade_in_pricing_history(model_id);
CREATE INDEX IF NOT EXISTS idx_market_conditions_type ON market_conditions(condition_type);
CREATE INDEX IF NOT EXISTS idx_market_conditions_active ON market_conditions(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_trade_in_models_updated_at 
    BEFORE UPDATE ON trade_in_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trade_in_requests_updated_at 
    BEFORE UPDATE ON trade_in_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_conditions_updated_at 
    BEFORE UPDATE ON market_conditions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample trade-in models
INSERT INTO trade_in_models (brand, model, storage_options, release_date, original_price, base_trade_in_value, market_demand, supply_level, seasonal_factor, competitor_price) VALUES
-- iPhone 15 Series
('Apple', 'iPhone 15 Pro Max', '["128GB", "256GB", "512GB", "1TB"]', '2023-09-22', 1199.00, 800.00, 0.95, 0.2, 1.15, 750.00),
('Apple', 'iPhone 15 Pro', '["128GB", "256GB", "512GB", "1TB"]', '2023-09-22', 999.00, 700.00, 0.9, 0.3, 1.1, 650.00),
('Apple', 'iPhone 15 Plus', '["128GB", "256GB", "512GB"]', '2023-09-22', 899.00, 650.00, 0.8, 0.4, 1.05, 600.00),
('Apple', 'iPhone 15', '["128GB", "256GB", "512GB"]', '2023-09-22', 799.00, 600.00, 0.85, 0.5, 1.0, 550.00),

-- iPhone 14 Series
('Apple', 'iPhone 14 Pro Max', '["128GB", "256GB", "512GB", "1TB"]', '2022-09-16', 1099.00, 750.00, 0.8, 0.4, 0.95, 700.00),
('Apple', 'iPhone 14 Pro', '["128GB", "256GB", "512GB", "1TB"]', '2022-09-16', 999.00, 650.00, 0.75, 0.5, 0.9, 600.00),
('Apple', 'iPhone 14 Plus', '["128GB", "256GB", "512GB"]', '2022-09-16', 899.00, 650.00, 0.7, 0.6, 0.85, 600.00),
('Apple', 'iPhone 14', '["128GB", "256GB", "512GB"]', '2022-09-16', 799.00, 550.00, 0.65, 0.7, 0.8, 500.00),

-- iPhone 13 Series
('Apple', 'iPhone 13 Pro Max', '["128GB", "256GB", "512GB", "1TB"]', '2021-09-24', 1099.00, 600.00, 0.6, 0.6, 0.8, 550.00),
('Apple', 'iPhone 13 Pro', '["128GB", "256GB", "512GB", "1TB"]', '2021-09-24', 999.00, 500.00, 0.55, 0.7, 0.75, 450.00),
('Apple', 'iPhone 13', '["128GB", "256GB", "512GB"]', '2021-09-24', 799.00, 400.00, 0.5, 0.8, 0.7, 350.00),
('Apple', 'iPhone 13 mini', '["128GB", "256GB", "512GB"]', '2021-09-24', 699.00, 350.00, 0.4, 0.9, 0.65, 300.00),

-- iPhone 12 Series
('Apple', 'iPhone 12 Pro Max', '["128GB", "256GB", "512GB"]', '2020-11-13', 1099.00, 450.00, 0.4, 0.8, 0.7, 400.00),
('Apple', 'iPhone 12 Pro', '["128GB", "256GB", "512GB"]', '2020-11-13', 999.00, 400.00, 0.35, 0.9, 0.65, 350.00),
('Apple', 'iPhone 12', '["64GB", "128GB", "256GB"]', '2020-11-13', 799.00, 350.00, 0.3, 0.95, 0.6, 300.00),
('Apple', 'iPhone 12 mini', '["64GB", "128GB", "256GB"]', '2020-11-13', 699.00, 300.00, 0.25, 0.98, 0.55, 250.00),

-- iPhone 11 Series
('Apple', 'iPhone 11 Pro Max', '["64GB", "256GB", "512GB"]', '2019-09-20', 1099.00, 250.00, 0.3, 0.9, 0.6, 200.00),
('Apple', 'iPhone 11 Pro', '["64GB", "256GB", "512GB"]', '2019-09-20', 999.00, 200.00, 0.25, 0.95, 0.55, 150.00),
('Apple', 'iPhone 11', '["64GB", "128GB", "256GB"]', '2019-09-20', 699.00, 150.00, 0.2, 0.98, 0.5, 100.00),

-- iPhone SE Series
('Apple', 'iPhone SE (3rd generation)', '["64GB", "128GB", "256GB"]', '2022-03-18', 429.00, 200.00, 0.6, 0.7, 0.8, 180.00),
('Apple', 'iPhone SE (2nd generation)', '["64GB", "128GB", "256GB"]', '2020-04-24', 399.00, 120.00, 0.3, 0.9, 0.6, 100.00),

-- iPhone X Series
('Apple', 'iPhone XS Max', '["64GB", "256GB", "512GB"]', '2018-09-21', 1099.00, 150.00, 0.2, 0.95, 0.5, 120.00),
('Apple', 'iPhone XS', '["64GB", "256GB", "512GB"]', '2018-09-21', 999.00, 120.00, 0.15, 0.98, 0.45, 100.00),
('Apple', 'iPhone XR', '["64GB", "128GB", "256GB"]', '2018-10-26', 749.00, 100.00, 0.1, 0.99, 0.4, 80.00),
('Apple', 'iPhone X', '["64GB", "256GB"]', '2017-11-03', 999.00, 80.00, 0.05, 0.99, 0.35, 60.00)

ON CONFLICT (brand, model) DO NOTHING;

-- Insert sample market conditions
INSERT INTO market_conditions (condition_type, condition_value, affected_models, start_date, end_date, description) VALUES
('seasonal', 1.15, '[]', '2024-09-01', '2024-12-31', 'Holiday season boost'),
('seasonal', 1.20, '[]', '2024-09-01', '2024-10-31', 'iPhone launch season'),
('seasonal', 0.90, '[]', '2025-01-01', '2025-02-28', 'Post-holiday dip'),
('seasonal', 0.95, '[]', '2024-06-01', '2024-08-31', 'Summer months dip'),
('demand', 1.30, '[]', '2024-01-01', '2024-12-31', 'High demand for new devices'),
('supply', 0.30, '[]', '2024-01-01', '2024-12-31', 'Low supply for new devices');

-- Enable Row Level Security
ALTER TABLE trade_in_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_in_pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trade_in_models (readable by all, writable by admins)
CREATE POLICY "trade_in_models_read_policy" ON trade_in_models
    FOR SELECT USING (true);

CREATE POLICY "trade_in_models_write_policy" ON trade_in_models
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for trade_in_requests
CREATE POLICY "trade_in_requests_read_policy" ON trade_in_requests
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "trade_in_requests_insert_policy" ON trade_in_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trade_in_requests_update_policy" ON trade_in_requests
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for trade_in_pricing_history (admin only)
CREATE POLICY "pricing_history_admin_policy" ON trade_in_pricing_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for market_conditions (admin only)
CREATE POLICY "market_conditions_admin_policy" ON market_conditions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

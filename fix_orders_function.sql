-- Fix for missing create_order_from_cart function
-- Run this in your Supabase Dashboard SQL Editor

-- First, let's check if the orders table exists
-- If not, create it
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    accessory_id UUID NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_accessory_id ON public.order_items(accessory_id);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    SELECT TO_CHAR(CURRENT_DATE, 'YYYYMMDD') INTO order_num;
    SELECT COUNT(*) + 1 INTO counter
    FROM public.orders
    WHERE DATE(created_at) = CURRENT_DATE;
    order_num := order_num || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update all order items" ON public.order_items;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all order items" ON public.order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create the missing function
CREATE OR REPLACE FUNCTION create_order_from_cart(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_billing_address JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    cart_item RECORD;
    subtotal DECIMAL(10,2) := 0;
    tax_rate DECIMAL(5,4) := 0.21; -- 21% VAT
    tax_amount DECIMAL(10,2);
    shipping_amount DECIMAL(10,2) := 0;
    total_amount DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from cart items
    FOR cart_item IN 
        SELECT ci.*, a.price, a.name
        FROM public.cart_items ci
        JOIN public.accessories a ON ci.accessory_id = a.id
        WHERE ci.user_id = p_user_id
    LOOP
        subtotal := subtotal + (cart_item.price * cart_item.quantity);
    END LOOP;
    
    -- Calculate tax and shipping
    tax_amount := subtotal * tax_rate;
    IF subtotal < 50 THEN
        shipping_amount := 5.99; -- Shipping cost for orders under €50
    END IF;
    total_amount := subtotal + tax_amount + shipping_amount;
    
    -- Create order
    INSERT INTO public.orders (
        user_id,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        shipping_address,
        billing_address,
        notes
    ) VALUES (
        p_user_id,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        p_shipping_address,
        COALESCE(p_billing_address, p_shipping_address),
        p_notes
    ) RETURNING id INTO order_id;
    
    -- Create order items from cart
    FOR cart_item IN 
        SELECT ci.*, a.price, a.name
        FROM public.cart_items ci
        JOIN public.accessories a ON ci.accessory_id = a.id
        WHERE ci.user_id = p_user_id
    LOOP
        INSERT INTO public.order_items (
            order_id,
            accessory_id,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            order_id,
            cart_item.accessory_id,
            cart_item.quantity,
            cart_item.price,
            cart_item.price * cart_item.quantity
        );
    END LOOP;
    
    -- Clear cart
    DELETE FROM public.cart_items WHERE user_id = p_user_id;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix accessories RLS policies to work without has_role function
-- Migration: 20250109000000_fix_accessories_rls.sql

-- ===========================================
-- DROP ALL EXISTING POLICIES FIRST
-- ===========================================

-- Drop ALL existing policies on accessories table
DROP POLICY IF EXISTS "Admins can read all accessories" ON public.accessories;
DROP POLICY IF EXISTS "Admins can manage accessories" ON public.accessories;
DROP POLICY IF EXISTS "Anyone can read active accessories" ON public.accessories;
DROP POLICY IF EXISTS "Authenticated users can manage accessories" ON public.accessories;

-- Drop ALL existing policies on wishlist_items table
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist_items;

-- Drop ALL existing policies on cart_items table
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;

-- Drop ALL existing policies on accessory_reviews table
DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.accessory_reviews;
DROP POLICY IF EXISTS "Anyone can read accessory reviews" ON public.accessory_reviews;

-- ===========================================
-- CREATE CLEAN, SIMPLE POLICIES
-- ===========================================

-- Accessories: Allow public read of active items, authenticated users can manage
CREATE POLICY "public_read_active_accessories" ON public.accessories
    FOR SELECT USING (is_active = true);

CREATE POLICY "authenticated_manage_accessories" ON public.accessories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Wishlist: Users can only manage their own items
CREATE POLICY "users_own_wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- Cart: Users can only manage their own items
CREATE POLICY "users_own_cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Reviews: Public read, users can manage their own
CREATE POLICY "public_read_reviews" ON public.accessory_reviews
    FOR SELECT USING (true);

CREATE POLICY "users_own_reviews" ON public.accessory_reviews
    FOR ALL USING (auth.uid() = user_id);

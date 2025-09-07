-- Test script to verify RLS policies are working
-- Run this in Supabase SQL Editor after applying the migration

-- Test 1: Check current policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('wishlist_items', 'cart_items', 'accessories', 'accessory_reviews')
ORDER BY tablename, policyname;

-- Test 2: Check if user is authenticated (replace with your user ID)
SELECT auth.uid() as current_user_id;

-- Test 3: Test wishlist insert (this should work if policies are correct)
-- Replace 'your-user-id' and 'your-accessory-id' with actual values
-- INSERT INTO public.wishlist_items (user_id, accessory_id) 
-- VALUES ('your-user-id', 'your-accessory-id');

-- Test 4: Check if tables exist and have correct structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('wishlist_items', 'cart_items', 'accessories', 'accessory_reviews')
ORDER BY table_name, ordinal_position;

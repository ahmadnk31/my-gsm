import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Accessory = Database['public']['Tables']['accessories']['Row'];
type AccessoryCategory = Database['public']['Tables']['accessory_categories']['Row'];
type AccessoryBrand = Database['public']['Tables']['accessory_brands']['Row'];
type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'];

// Accessories queries
export const useAccessories = (filters?: {
  categories?: string[];
  brands?: string[];
  search?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  stockFilter?: 'in-stock' | 'out-of-stock';
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['accessories', filters],
    queryFn: async () => {
      console.log('Accessories query filters:', filters);
      let query = supabase
        .from('accessories')
        .select(`
          *,
          accessory_categories (
            id,
            name,
            icon,
            slug
          ),
          accessory_brands (
            id,
            name
          )
        `)
        .eq('is_active', true);

      // Multiple categories filter
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }

      // Multiple brands filter
      if (filters?.brands && filters.brands.length > 0) {
        query = query.in('brand_id', filters.brands);
      }

      // Search filter
      if (filters?.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm) {
          // Use a simpler search approach
          query = query.or(`name.ilike.%${searchTerm}%`);
        }
      }

      // Price range filter
      if (filters?.minPrice !== undefined && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined && filters.maxPrice < 1000) {
        query = query.lte('price', filters.maxPrice);
      }

      // Rating filter
      if (filters?.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }

      // Stock filter
      if (filters?.stockFilter === 'in-stock') {
        query = query.gt('stock_quantity', 0);
      } else if (filters?.stockFilter === 'out-of-stock') {
        query = query.eq('stock_quantity', 0);
      }

      // Featured filter
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
        default:
          query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Accessories query error:', error);
        toast.error('Failed to fetch accessories');
        throw error;
      }

      return data as (Accessory & {
        accessory_categories: AccessoryCategory | null;
        accessory_brands: AccessoryBrand | null;
      })[];
    },
  });
};

export const useAccessoryCategories = () => {
  return useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accessory_categories')
        .select('id, name, description, icon, slug')
        .order('name');

      if (error) {
        toast.error('Failed to fetch categories');
        throw error;
      }

      return data as AccessoryCategory[];
    },
  });
};

export const useAccessoryBrands = () => {
  return useQuery({
    queryKey: ['accessory-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accessory_brands')
        .select('id, name, description, image_url, website_url')
        .order('name');

      if (error) {
        toast.error('Failed to fetch brands');
        throw error;
      }

      return data as AccessoryBrand[];
    },
  });
};

// Wishlist management
export const useWishlist = (userId?: string) => {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          accessories (
            *,
            accessory_categories (name, slug),
            accessory_brands (name)
          )
        `)
        .eq('user_id', userId);

      if (error) {
        toast.error('Failed to fetch wishlist');
        throw error;
      }

      return data as (WishlistItem & {
        accessories: Accessory & {
          accessory_categories: { name: string; slug: string } | null;
          accessory_brands: { name: string } | null;
        };
      })[];
    },
    enabled: !!userId,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accessoryId }: { userId: string; accessoryId: string }) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: userId,
          accessory_id: accessoryId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      toast.success('Added to wishlist');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accessoryId }: { userId: string; accessoryId: string }) => {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('accessory_id', accessoryId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    },
  });
};

// Cart management
export const useCart = (userId?: string) => {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          accessories (
            *,
            accessory_categories (name, slug),
            accessory_brands (name)
          )
        `)
        .eq('user_id', userId);

      if (error) {
        toast.error('Failed to fetch cart');
        throw error;
      }

      return data as (CartItem & {
        accessories: Accessory & {
          accessory_categories: { name: string; slug: string } | null;
          accessory_brands: { name: string } | null;
        };
      })[];
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accessoryId, quantity = 1 }: { 
      userId: string; 
      accessoryId: string; 
      quantity?: number; 
    }) => {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('accessory_id', accessoryId)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({
            quantity: existingItem.quantity + quantity,
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            accessory_id: accessoryId,
            quantity,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast.success('Added to cart');
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accessoryId, quantity }: { 
      userId: string; 
      accessoryId: string; 
      quantity: number; 
    }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('accessory_id', accessoryId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('accessory_id', accessoryId)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: () => {
      toast.error('Failed to update cart');
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, accessoryId }: { userId: string; accessoryId: string }) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('accessory_id', accessoryId);

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast.success('Removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove from cart');
    },
  });
};

// Single accessory query
export const useAccessoryById = (id?: string) => {
  return useQuery({
    queryKey: ['accessory', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_categories (
            id,
            name,
            icon
          ),
          accessory_brands (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        toast.error('Failed to fetch accessory');
        throw error;
      }

      return data as Accessory & {
        accessory_categories: AccessoryCategory | null;
        accessory_brands: AccessoryBrand | null;
      };
    },
    enabled: !!id,
  });
};

// Related accessories query
export const useRelatedAccessories = (currentId?: string, categoryId?: string, brandId?: string) => {
  return useQuery({
    queryKey: ['related-accessories', currentId, categoryId, brandId],
    queryFn: async () => {
      if (!currentId) return [];

      let query = supabase
        .from('accessories')
        .select(`
          *,
          accessory_categories (
            id,
            name,
            icon
          ),
          accessory_brands (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .neq('id', currentId)
        .limit(8);

      // Prioritize same category and brand
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch related accessories:', error);
        return [];
      }

      return data as (Accessory & {
        accessory_categories: AccessoryCategory | null;
        accessory_brands: AccessoryBrand | null;
      })[];
    },
    enabled: !!currentId,
  });
};

// Single accessory query by slug
export const useAccessoryBySlug = (categorySlug?: string, productSlug?: string) => {
  return useQuery({
    queryKey: ['accessory-by-slug', categorySlug, productSlug],
    queryFn: async () => {
      if (!categorySlug || !productSlug) return null;

      const { data, error } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_categories!inner (
            id,
            name,
            icon,
            slug
          ),
          accessory_brands (
            id,
            name
          )
        `)
        .eq('accessory_categories.slug', categorySlug)
        .eq('slug', productSlug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Failed to fetch accessory by slug:', error);
        return null;
      }

      return data as Accessory & {
        accessory_categories: AccessoryCategory | null;
        accessory_brands: AccessoryBrand | null;
      };
    },
    enabled: !!categorySlug && !!productSlug,
  });
};

// Category by slug query
export const useAccessoryCategoryBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['accessory-category-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('accessory_categories')
        .select('id, name, description, icon, slug')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Failed to fetch category by slug:', error);
        return null;
      }

      return data as AccessoryCategory;
    },
    enabled: !!slug,
  });
};

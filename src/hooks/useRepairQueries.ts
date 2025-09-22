import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DeviceCategory = Tables<'device_categories'>;
type DeviceBrand = Tables<'device_brands'>;
type DeviceModel = Tables<'device_models'>;
type DevicePart = Tables<'device_parts'>;
type PartPricing = Tables<'part_pricing'>;

interface PartWithPricing extends DevicePart {
  pricing: PartPricing[];
}

// Categories query
export const useDeviceCategories = () => {
  return useQuery({
    queryKey: ['device-categories'],
    queryFn: async (): Promise<DeviceCategory[]> => {
      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Brands query
export const useDeviceBrands = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ['device-brands', categoryId],
    queryFn: async (): Promise<DeviceBrand[]> => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from('device_brands')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Models query
export const useDeviceModels = (brandId: string | undefined) => {
  return useQuery({
    queryKey: ['device-models', brandId],
    queryFn: async (): Promise<DeviceModel[]> => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from('device_models')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Parts with pricing query
export const useDeviceParts = (modelId: string | undefined) => {
  return useQuery({
    queryKey: ['device-parts', modelId],
    queryFn: async (): Promise<PartWithPricing[]> => {
      if (!modelId) return [];
      
      const { data: partsData, error: partsError } = await supabase
        .from('device_parts')
        .select('*')
        .eq('model_id', modelId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (partsError) throw partsError;

      // Fetch pricing for each part
      const partsWithPricing = await Promise.all(
        (partsData || []).map(async (part) => {
          const { data: pricingData, error: pricingError } = await supabase
            .from('part_pricing')
            .select('*')
            .eq('part_id', part.id)
            .eq('is_active', true)
            .order('price', { ascending: true });

          if (pricingError) {
            console.error('Error fetching pricing for part:', part.id, pricingError);
            return { ...part, pricing: [] };
          }

          return { ...part, pricing: pricingData || [] };
        })
      );

      return partsWithPricing;
    },
    enabled: !!modelId,
    staleTime: 2 * 60 * 1000, // 2 minutes for parts (more dynamic)
    gcTime: 5 * 60 * 1000,
  });
};

// Individual entity queries for navigation state
export const useDeviceCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ['device-category', categoryId],
    queryFn: async (): Promise<DeviceCategory | null> => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

export const useDeviceBrand = (brandId: string | undefined) => {
  return useQuery({
    queryKey: ['device-brand', brandId],
    queryFn: async (): Promise<DeviceBrand | null> => {
      if (!brandId) return null;
      
      const { data, error } = await supabase
        .from('device_brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

export const useDeviceModel = (modelId: string | undefined) => {
  return useQuery({
    queryKey: ['device-model', modelId],
    queryFn: async (): Promise<DeviceModel | null> => {
      if (!modelId) return null;
      
      const { data, error } = await supabase
        .from('device_models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!modelId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Find brand by name (for URL parameter handling)
export const useDeviceBrandByName = (brandName: string | undefined) => {
  return useQuery({
    queryKey: ['device-brand-by-name', brandName],
    queryFn: async (): Promise<DeviceBrand | null> => {
      if (!brandName) return null;
      
      const { data, error } = await supabase
        .from('device_brands')
        .select('*')
        .ilike('name', brandName)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    },
    enabled: !!brandName,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Find category by name (for URL parameter handling)
export const useDeviceCategoryByName = (categoryName: string | undefined) => {
  return useQuery({
    queryKey: ['device-category-by-name', categoryName],
    queryFn: async (): Promise<DeviceCategory | null> => {
      if (!categoryName) return null;
      
      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .ilike('name', categoryName)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    },
    enabled: !!categoryName,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Find category by slug (generated from name)
export const useDeviceCategoryBySlug = (categorySlug: string | undefined) => {
  return useQuery({
    queryKey: ['device-category-by-slug', categorySlug],
    queryFn: async (): Promise<DeviceCategory | null> => {
      if (!categorySlug) return null;
      
      // Get all active categories and find the one with matching slug
      const { data, error } = await supabase
        .from('device_categories')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Find category by matching generated slug (no separators)
      const category = data?.find(cat => {
        const generatedSlug = cat.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');
        return generatedSlug === categorySlug;
      });

      return category || null;
    },
    enabled: !!categorySlug,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Find brand by slug (generated from name)
export const useDeviceBrandBySlug = (brandSlug: string | undefined) => {
  return useQuery({
    queryKey: ['device-brand-by-slug', brandSlug],
    queryFn: async (): Promise<DeviceBrand | null> => {
      if (!brandSlug) return null;
      
      // Get all active brands and find the one with matching slug
      const { data, error } = await supabase
        .from('device_brands')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Find brand by matching generated slug (no separators)
      const brand = data?.find(br => {
        const generatedSlug = br.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');
        return generatedSlug === brandSlug;
      });

      return brand || null;
    },
    enabled: !!brandSlug,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

// Find model by slug (generated from name)
export const useDeviceModelBySlug = (modelSlug: string | undefined) => {
  return useQuery({
    queryKey: ['device-model-by-slug', modelSlug],
    queryFn: async (): Promise<DeviceModel | null> => {
      if (!modelSlug) return null;
      
      // Get all active models and find the one with matching slug
      const { data, error } = await supabase
        .from('device_models')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Find model by matching generated slug (no separators)
      const model = data?.find(mod => {
        const generatedSlug = mod.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');
        return generatedSlug === modelSlug;
      });

      return model || null;
    },
    enabled: !!modelSlug,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

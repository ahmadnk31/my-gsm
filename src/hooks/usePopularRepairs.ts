import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PopularRepairItem {
  id: string;
  name: string;
  description?: string;
  device_model: string;
  device_type: string;
  estimated_duration?: string;
  estimated_price?: number;
  image_url?: string;
  parts_required: string[];
  price_range: string;
  min_price: number;
  max_price: number;
  popularity_score: number;
  category: string;
}

export interface PopularDevicePart {
  id: string;
  name: string;
  description?: string;
  category: string;
  model_name: string;
  brand_name: string;
  device_type: string;
  estimated_duration?: string;
  image_url?: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  price_range: string;
  quality_options: string[];
  availability_status: string;
}

export const usePopularRepairItems = () => {
  return useQuery({
    queryKey: ['popular-repair-items'],
    queryFn: async (): Promise<PopularRepairItem[]> => {
      const { data: repairItems, error } = await supabase
        .from('repair_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching repair items:', error);
        throw error;
      }

      return repairItems.map((item, index) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        device_model: item.device_model,
        device_type: item.device_type,
        estimated_duration: item.estimated_duration,
        estimated_price: item.estimated_price,
        image_url: item.image_url,
        parts_required: item.parts_required || [],
        price_range: item.estimated_price ? `€${item.estimated_price}` : 'Quote needed',
        min_price: item.estimated_price || 50,
        max_price: item.estimated_price ? Math.round(item.estimated_price * 1.3) : 200,
        popularity_score: Math.max(60, 95 - (index * 4)),
        category: inferCategory(item.name)
      }));
    },
  });
};

export const usePopularDeviceParts = () => {
  return useQuery({
    queryKey: ['popular-device-parts'],
    queryFn: async (): Promise<PopularDevicePart[]> => {
      const { data: parts, error } = await supabase
        .from('device_parts')
        .select(`
          *,
          device_models!inner (
            name,
            device_brands!inner (
              name,
              device_categories!inner (
                name
              )
            )
          ),
          part_pricing (
            price,
            quality_type,
            availability_status,
            supplier
          )
        `)
        .eq('is_active', true)
        .eq('device_models.is_active', true)
        .eq('device_models.device_brands.is_active', true)
        .limit(6);

      if (error) {
        console.error('Error fetching device parts:', error);
        throw error;
      }

      return parts.map((part: any) => {
        const pricing = part.part_pricing || [];
        const prices = pricing.map((p: any) => p.price).filter((p: any) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 50;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 200;
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 125;

        return {
          id: part.id,
          name: part.name,
          description: part.description,
          category: part.category,
          model_name: part.device_models?.name || 'Unknown Model',
          brand_name: part.device_models?.device_brands?.name || 'Unknown Brand',
          device_type: part.device_models?.device_brands?.device_categories?.name || 'Device',
          estimated_duration: part.estimated_duration,
          image_url: part.image_url,
          min_price: minPrice,
          max_price: maxPrice,
          avg_price: avgPrice,
          price_range: `€${minPrice} - €${maxPrice}`,
          quality_options: [...new Set(pricing.map((p: any) => p.quality_type).filter((q: any) => typeof q === 'string'))] as string[],
          availability_status: pricing.find((p: any) => p.availability_status)?.availability_status || 'in_stock'
        };
      });
    },
  });
};

function inferCategory(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('screen') || lowerName.includes('display')) return 'Screen Repair';
  if (lowerName.includes('battery')) return 'Battery Replacement';
  if (lowerName.includes('camera')) return 'Camera Repair';
  if (lowerName.includes('charging') || lowerName.includes('port')) return 'Hardware Repair';
  if (lowerName.includes('speaker') || lowerName.includes('audio')) return 'Audio Repair';
  if (lowerName.includes('button')) return 'Button Repair';
  if (lowerName.includes('water') || lowerName.includes('liquid')) return 'Water Damage';
  if (lowerName.includes('glass') || lowerName.includes('back')) return 'Cosmetic Repair';
  
  return 'General Repair';
}

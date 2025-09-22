import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Banner {
  id: string;
  type: 'promotion' | 'announcement' | 'feature' | 'seasonal';
  title: string;
  subtitle?: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  icon?: React.ReactNode;
}

// Database banners hook with real-time data
export const useActiveBanners = () => {
  const { t } = useLanguage();

  return useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: true });

      if (error) {
        console.error('Error fetching banners:', error);
        // Fallback to default banners if database query fails
        return getDefaultBanners(t);
      }

      // Transform database banners to component format
      const banners: Banner[] = (data || []).map(banner => ({
        id: banner.id,
        type: banner.type as Banner['type'],
        title: banner.title,
        subtitle: banner.subtitle || undefined,
        description: banner.description,
        buttonText: banner.button_text || undefined,
        buttonLink: banner.button_link || undefined,
        image: banner.image_url || undefined,
        backgroundColor: banner.background_color,
        textColor: banner.text_color,
        priority: banner.priority,
        startDate: banner.start_date ? new Date(banner.start_date) : undefined,
        endDate: banner.end_date ? new Date(banner.end_date) : undefined,
        isActive: banner.is_active,
      }));

      // If no banners from database, use default ones
      return banners.length > 0 ? banners : getDefaultBanners(t);
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Default banners as fallback
const getDefaultBanners = (t: (key: string) => string): Banner[] => [
  {
    id: 'default-1',
    type: 'promotion',
    title: t('banner.promotion.title') || '50% OFF Screen Repairs',
    subtitle: t('banner.promotion.subtitle') || 'Limited Time Offer',
    description: t('banner.promotion.description') || 'Professional screen replacement for all major phone brands. Book now and save big!',
    buttonText: t('banner.promotion.buttonText') || 'Book Repair',
    buttonLink: '/repairs',
    backgroundColor: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700',
    textColor: 'text-white',
    priority: 1,
    isActive: true,
  },
  {
    id: 'default-2',
    type: 'feature',
    title: t('banner.feature.title') || 'New iPhone 15 Accessories',
    subtitle: t('banner.feature.subtitle') || 'Just Arrived',
    description: t('banner.feature.description') || 'Premium cases, wireless chargers, and screen protectors for the latest iPhone.',
    buttonText: t('banner.feature.buttonText') || 'Shop Now',
    buttonLink: '/accessories',
    backgroundColor: 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600',
    textColor: 'text-white',
    priority: 2,
    isActive: true,
  },
  {
    id: 'default-3',
    type: 'announcement',
    title: t('banner.announcement.title') || 'Extended Warranty Available',
    subtitle: t('banner.announcement.subtitle') || 'Peace of Mind',
    description: t('banner.announcement.description') || '6-month warranty on all repair services. Professional quality guaranteed.',
    buttonText: t('banner.announcement.buttonText') || 'Learn More',
    buttonLink: '/repairs',
    backgroundColor: 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600',
    textColor: 'text-white',
    priority: 3,
    isActive: true,
  },
  {
    id: 'default-4',
    type: 'seasonal',
    title: t('banner.seasonal.title') || 'Holiday Special Deals',
    subtitle: t('banner.seasonal.subtitle') || 'Gift Your Loved Ones',
    description: t('banner.seasonal.description') || 'Premium phone accessories at unbeatable prices. Perfect gifts for tech lovers!',
    buttonText: t('banner.seasonal.buttonText') || 'Explore Gifts',
    buttonLink: '/accessories',
    backgroundColor: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600',
    textColor: 'text-white',
    priority: 4,
    isActive: true,
  }
];

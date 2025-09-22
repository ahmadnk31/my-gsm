
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { DynamicBanner } from "@/components/DynamicBanner";


const Hero = () => {
  const { t } = useLanguage();
  
  // Fetch real stats from database
  const { data: stats } = useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const [bookingsResult, categoriesResult, accessoriesResult] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('device_categories').select('id', { count: 'exact', head: true }),
        supabase.from('accessories').select('id', { count: 'exact', head: true }),
      ]);

      return {
        customers: bookingsResult.count || 0,
        categories: categoriesResult.count || 0,
        accessories: accessoriesResult.count || 0
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Get dynamic content based on real data
  const getHeroContent = () => {
    const totalProducts = (stats?.categories || 0) + (stats?.accessories || 0);
    return {
      customers: stats?.customers || 50,
      products: totalProducts || 500,
      subtitle: totalProducts > 100 ? "Premium Collection" : "Growing Collection"
    };
  };

  const heroContent = getHeroContent();

  return (
    <section className="relative">
      {/* Dynamic Banner with responsive height */}
      <div className="w-full">
        <DynamicBanner 
          autoSlide={true}
          slideInterval={8000}
          showNavigation={true}
          showCloseButton={false}
        />
      </div>
    </section>
  );
};

export default Hero;
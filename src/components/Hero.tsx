import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Zap, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import heroPhoneImage from "@/assets/hero-phone.jpg";

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
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/30" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-primary/20 to-primary-glow/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-full blur-2xl animate-pulse" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          {/* Enhanced Content */}
          <div className="text-center lg:text-left animate-fade-in space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full text-white border border-white/20 shadow-elegant">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">Rated #1 Phone Store</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-display text-white">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl sm:text-2xl text-white/80 font-medium">
                {t('home.hero.subtitle')}
              </p>
            </div>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed">
              {t('home.hero.description')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/accessories">
                <Button size="lg" className="btn-primary group">
                  {t('home.hero.cta')}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/repairs">
                <Button variant="outline" size="lg" className="btn-ghost group border-2 border-white/30 hover:bg-white/10 backdrop-blur-md px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300">
                  {t('repairs.bookAppointment')}
                  <Shield className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                  {heroContent.customers.toLocaleString()}+
                </div>
                <div className="text-white/60 text-sm font-medium">Happy Customers</div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-success/20 to-success/80 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-success transition-colors">
                  {heroContent.products}+
                </div>
                <div className="text-white/60 text-sm font-medium">Products Available</div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/80 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-warning transition-colors">
                  24/7
                </div>
                <div className="text-white/60 text-sm font-medium">Support</div>
              </div>
            </div>
          </div>

          {/* Enhanced Phone Image */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary-glow/20 to-primary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              
              {/* Phone Image */}
              <div className="relative glass rounded-3xl p-8 border border-white/20 shadow-elegant">
                <img 
                  src={heroPhoneImage} 
                  alt="Latest Smartphone" 
                  className="w-full max-w-md lg:max-w-lg h-auto object-contain animate-float filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full animate-bounce" style={{ animationDelay: "1s" }} />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-primary-glow to-primary rounded-full animate-bounce" style={{ animationDelay: "2s" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
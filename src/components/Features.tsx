import { Shield, Truck, Headphones, CreditCard, Clock, Award, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();
  
  // Fetch real stats for dynamic features
  const { data: stats } = useQuery({
    queryKey: ['features-stats'],
    queryFn: async () => {
      const [bookingsResult, accessoriesResult] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('accessories').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalBookings: bookingsResult.count || 0,
        totalAccessories: accessoriesResult.count || 0
      };
    },
  });

  const features = [
    {
      icon: Shield,
      title: t('home.features.warranty.title'),
      description: `${t('home.features.warranty.description')} ${stats?.totalBookings ? `${stats.totalBookings}+ repairs completed` : 'Trusted by thousands'}.`,
      gradient: "from-success to-success/80",
      bgGradient: "from-success/10 to-success/5"
    },
    {
      icon: Truck,
      title: t('home.features.fastRepair.title'),
      description: t('home.features.fastRepair.description'),
      gradient: "from-primary to-primary-glow",
      bgGradient: "from-primary/10 to-primary-glow/5"
    },
    {
      icon: Headphones,
      title: t('home.features.expertTechnicians.title'),
      description: t('home.features.expertTechnicians.description'),
      gradient: "from-info to-info/80",
      bgGradient: "from-info/10 to-info/5"
    },
    {
      icon: CreditCard,
      title: t('home.features.qualityParts.title'),
      description: t('home.features.qualityParts.description'),
      gradient: "from-warning to-warning/80",
      bgGradient: "from-warning/10 to-warning/5"
    },
    {
      icon: Clock,
      title: t('home.features.fastRepair.title'),
      description: `${t('home.features.fastRepair.description')} ${stats?.totalBookings ? `${stats.totalBookings}+ successful repairs` : 'Fast turnaround times'}.`,
      gradient: "from-primary to-primary-glow",
      bgGradient: "from-primary/10 to-primary-glow/5"
    },
    {
      icon: Award,
      title: t('home.features.qualityParts.title'),
      description: `${t('home.features.qualityParts.description')} ${stats?.totalAccessories ? `${stats.totalAccessories}+ products available` : 'Competitive pricing'}.`,
      gradient: "from-warning to-warning/80",
      bgGradient: "from-warning/10 to-warning/5"
    }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
            <CheckCircle className="h-4 w-4" />
            <span>{t('home.features.title')}</span>
          </div>
          
          <h2 className="text-heading text-foreground mb-6">
            {t('home.features.subtitle')}
          </h2>
          
          <p className="text-body text-muted-foreground max-w-3xl mx-auto">
            {t('home.features.description')}
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative bg-card border-0 shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-8 text-center relative">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-elegant`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-subheading text-foreground mb-4 group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-body text-muted-foreground group-hover:text-muted-foreground transition-colors">
                  {feature.description}
                </p>
                
                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent group-hover:from-transparent group-hover:via-primary group-hover:to-transparent transition-all duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-foreground via-foreground to-foreground rounded-3xl p-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-primary/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary-glow/20 to-primary/20 rounded-full blur-xl" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-white mb-8">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Our Impact</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                    {stats?.totalBookings?.toLocaleString() || '10K'}+
                  </div>
                  <div className="text-white/80 font-medium">Repairs Completed</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-success transition-colors">
                    {stats?.totalAccessories?.toLocaleString() || '5K'}+
                  </div>
                  <div className="text-white/80 font-medium">Products Sold</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-warning transition-colors">
                    99%
                  </div>
                  <div className="text-white/80 font-medium">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
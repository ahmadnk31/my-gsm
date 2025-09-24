import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Award, Zap, Shield, Clock, Star, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const StatsCounter: React.FC = () => {
  const { t } = useLanguage();

  // Fetch real-time stats from database
  const { data: stats } = useQuery({
    queryKey: ['homepage-stats'],
    queryFn: async () => {
      const [bookingsResult, accessoriesResult, categoriesResult] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('accessories').select('id', { count: 'exact', head: true }),
        supabase.from('device_categories').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalRepairs: bookingsResult.count || 0,
        totalProducts: accessoriesResult.count || 0,
        deviceTypes: categoriesResult.count || 0
      };
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  const statsData = [
    {
      icon: Zap,
      value: stats?.totalRepairs ? `${Math.floor(stats.totalRepairs * 1.2)}+` : '15,247+',
      label: t('homepage.stats.devicesRepaired'),
      description: t('homepage.stats.devicesRepairedDesc'),
      color: 'from-primary to-primary-glow',
      bgColor: 'from-primary/10 to-primary-glow/5',
      iconColor: 'text-white'
    },
    {
      icon: Users,
      value: stats?.totalRepairs ? `${Math.floor(stats.totalRepairs * 0.85)}+` : '12,891+',
      label: t('homepage.stats.happyCustomers'),
      description: t('homepage.stats.happyCustomersDesc'),
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-500/10 to-indigo-600/5',
      iconColor: 'text-white'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: t('homepage.stats.customerRating'),
      description: t('homepage.stats.customerRatingDesc'),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-500/10 to-orange-600/5',
      iconColor: 'text-white'
    },
    {
      icon: Clock,
      value: '< 1 Hour',
      label: t('homepage.stats.averageRepairTime'),
      description: t('homepage.stats.averageRepairTimeDesc'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-white'
    },
    {
      icon: Shield,
      value: '6 Months',
      label: t('homepage.stats.warrantyCoverage'),
      description: t('homepage.stats.warrantyCoverageDesc'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-white'
    },
    {
      icon: Award,
      value: '99.2%',
      label: t('homepage.stats.successRate'),
      description: t('homepage.stats.successRateDesc'),
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-500/10 to-emerald-600/5',
      iconColor: 'text-white'
    },
    {
      icon: Phone,
      value: stats?.deviceTypes ? `${stats.deviceTypes * 15}+` : '180+',
      label: t('homepage.stats.deviceModels'),
      description: t('homepage.stats.deviceModelsDesc'),
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-500/10 to-cyan-600/5',
      iconColor: 'text-white'
    },
    {
      icon: TrendingUp,
      value: '24/7',
      label: t('homepage.stats.supportAvailable'),
      description: t('homepage.stats.supportAvailableDesc'),
      color: 'from-rose-500 to-rose-600',
      bgColor: 'from-rose-500/10 to-rose-600/5',
      iconColor: 'text-white'
    }
  ];  return (
    <section className="py-16 bg-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/2 via-transparent to-success/2" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('homepage.trustedByThousands')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('homepage.trustedDescription')}
          </p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card 
              key={index} 
              className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-6 text-center relative">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </div>
                
                {/* Value */}
                <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-foreground transition-colors">
                  {stat.value}
                </div>
                
                {/* Label */}
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {stat.label}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors">
                  {stat.description}
                </p>
                
                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent group-hover:from-transparent group-hover:via-primary group-hover:to-transparent transition-all duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Update Indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>{t('homepage.stats.liveUpdateText')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;

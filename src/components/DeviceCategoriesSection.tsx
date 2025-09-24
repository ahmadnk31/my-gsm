import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Smartphone, Tablet, Laptop, Watch, ArrowRight, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DeviceCategoriesSection = () => {
  const { t } = useLanguage();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['device-categories-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_categories')
        .select(`
          id,
          name,
          description,
          icon_name
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Get device counts separately
  const { data: deviceCounts } = useQuery({
    queryKey: ['device-counts'],
    queryFn: async () => {
      const { data: brands } = await supabase
        .from('device_brands')
        .select('id, category_id')
        .eq('is_active', true);

      const { data: models } = await supabase
        .from('device_models')
        .select('id, brand_id, device_brands!inner(category_id)')
        .eq('is_active', true);

      const counts: Record<string, { brands: number; models: number }> = {};
      
      // Count brands by category
      brands?.forEach(brand => {
        if (!counts[brand.category_id]) {
          counts[brand.category_id] = { brands: 0, models: 0 };
        }
        counts[brand.category_id].brands++;
      });

      // Count models by category
      models?.forEach(model => {
        const categoryId = (model.device_brands as any).category_id;
        if (counts[categoryId]) {
          counts[categoryId].models++;
        }
      });

      return counts;
    },
  });

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'smartphone':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'laptop':
        return Laptop;
      case 'watch':
        return Watch;
      default:
        return Smartphone;
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Wrench className="h-4 w-4" />
            <span>{t('homepage.deviceCategories.sectionLabel')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('homepage.deviceCategories.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('homepage.deviceCategories.subtitle')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories?.map((category) => {
            const IconComponent = getIcon(category.icon_name);
            const counts = deviceCounts?.[category.id] || { brands: 0, models: 0 };
            const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {counts.brands} {counts.brands === 1 ? t('homepage.deviceCategories.brand') : t('homepage.deviceCategories.brands')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {counts.models} {counts.models === 1 ? t('homepage.deviceCategories.model') : t('homepage.deviceCategories.models')}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link to={`/repairs?category=${categorySlug}`}>
                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      variant="outline"
                    >
                      {t('homepage.deviceCategories.viewRepairs')}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {t('homepage.deviceCategories.notFound')}
          </p>
          <Link to="/repairs">
            <Button size="lg" className="px-8">
              {t('homepage.deviceCategories.viewAllServices')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DeviceCategoriesSection;

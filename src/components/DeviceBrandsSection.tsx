import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, ArrowRight, Star, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DeviceBrandsSection = () => {
  const { t } = useLanguage();
  
  const { data: brands, isLoading } = useQuery({
    queryKey: ['device-brands-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_brands')
        .select(`
          id,
          name,
          description,
          logo_url,
          category_id,
          device_categories(name, icon_name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
  });

  // Get model counts for each brand
  const { data: modelCounts } = useQuery({
    queryKey: ['brand-model-counts'],
    queryFn: async () => {
      const { data: models } = await supabase
        .from('device_models')
        .select('id, brand_id')
        .eq('is_active', true);

      const counts: Record<string, number> = {};
      models?.forEach(model => {
        counts[model.brand_id] = (counts[model.brand_id] || 0) + 1;
      });

      return counts;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            <span>{t('homepage.deviceBrands.sectionLabel')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('homepage.deviceBrands.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('homepage.deviceBrands.subtitle')}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands?.map((brand) => {
            const modelCount = modelCounts?.[brand.id] || 0;
            const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');
            const categorySlug = brand.device_categories?.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <Card key={brand.id} className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 bg-card">
                <CardHeader className="text-center pb-4">
                  {/* Brand Logo/Name */}
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-2xl font-bold text-primary ${brand.logo_url ? 'hidden' : ''}`}>
                      {brand.name.charAt(0)}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {brand.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {brand.device_categories?.name} Brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Brand Description */}
                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {brand.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {modelCount} {modelCount === 1 ? t('homepage.deviceCategories.model') : t('homepage.deviceCategories.models')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {t('homepage.deviceBrands.certified')}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link to={`/repairs?category=${categorySlug}&brand=${brandSlug}`}>
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="outline"
                        size="sm"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        {t('homepage.deviceBrands.viewRepairs')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {t('homepage.deviceBrands.supportedBrands')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/repairs">
              <Button size="lg" className="px-8">
                {t('homepage.deviceBrands.viewAllBrands')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/accessories">
              <Button variant="outline" size="lg" className="px-8">
                {t('homepage.deviceBrands.browseAccessories')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceBrandsSection;

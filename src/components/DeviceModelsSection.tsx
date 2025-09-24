import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Smartphone, ArrowRight, Calendar, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuoteRequestModal } from "./quote/QuoteRequestModal";

const DeviceModelsSection = () => {
  const { t } = useLanguage();
  
  const { data: models, isLoading } = useQuery({
    queryKey: ['device-models-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_models')
        .select(`
          id,
          name,
          description,
          image_url,
          release_year,
          brand_id,
          device_brands(
            name,
            logo_url,
            device_categories(name, icon_name)
          ),
          device_parts!inner(id)
        `)
        .eq('is_active', true)
        .eq('device_parts.is_active', true)
        .limit(8);

      if (error) throw error;

      // Filter to only include models with parts and sort by release year (newest first)
      const filteredData = (data || [])
        .filter(model => model.device_parts && model.device_parts.length > 0)
        .sort((a, b) => {
          const aYear = a.release_year || 0;
          const bYear = b.release_year || 0;
          return bYear - aYear;
        });

      return filteredData;
    },
  });

  // Get parts count for each model from the main query data
  const partsCounts = models?.reduce((acc, model) => {
    acc[model.id] = model.device_parts?.length || 0;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-lg" />
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
            <Smartphone className="h-4 w-4" />
            <span>{t('homepage.deviceModels.sectionLabel')}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('homepage.deviceModels.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('homepage.deviceModels.subtitle')}
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {models?.map((model) => {
            const partsCount = partsCounts?.[model.id] || 0;
            const modelSlug = model.name.toLowerCase().replace(/\s+/g, '-');
            const brandSlug = model.device_brands?.name.toLowerCase().replace(/\s+/g, '-');
            const categorySlug = model.device_brands?.device_categories?.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <Card key={model.id} className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/30 overflow-hidden">
                <div className="relative">
                  {/* Model Image */}
                  <div className="mx-auto bg-gradient-to-br p-2 from-muted/50 to-muted/30 flex items-center justify-center overflow-hidden">
                    {model.image_url ? (
                      <img 
                        src={model.image_url} 
                        alt={model.name}
                        className="w-full h-full object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`flex flex-col items-center justify-center text-muted-foreground ${model.image_url ? 'hidden' : ''}`}>
                      <Smartphone className="h-16 w-16 mb-2" />
                      <p className="text-sm font-medium text-center px-4">{model.name}</p>
                    </div>
                  </div>

                  {/* Brand Logo Overlay */}
                  {model.device_brands?.logo_url && (
                    <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
                      <img 
                        src={model.device_brands.logo_url} 
                        alt={model.device_brands.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Release Year Badge */}
                  {model.release_year && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {model.release_year}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {model.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {model.device_brands?.name} {model.device_brands?.device_categories?.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Model Description */}
                  {model.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {model.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Wrench className="h-3 w-3 mr-1" />
                      {partsCount} {partsCount === 1 ? t('homepage.deviceModels.service') : t('homepage.deviceModels.services')}
                    </Badge>
                    {model.release_year && (
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date().getFullYear() - model.release_year} {t('homepage.deviceModels.years')}
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link to={`/repairs?category=${categorySlug}&brand=${brandSlug}&model=${modelSlug}`}>
                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-4"
                      variant="outline"
                      size="sm"
                    >
                      {t('homepage.deviceModels.viewRepairs')}
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
            {t('homepage.deviceModels.notFoundModel')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/repairs">
              <Button size="lg" className="px-8">
                {t('homepage.deviceModels.findYourDevice')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <QuoteRequestModal>
              <Button variant="outline" size="lg" className="px-8">
                {t('homepage.deviceModels.getCustomQuote')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </QuoteRequestModal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceModelsSection;

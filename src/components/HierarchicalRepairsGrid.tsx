import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { 
  ArrowLeft, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Watch,
  ChevronRight,
  Clock,
  DollarSign,
  Star,
  Shield,
  Package
} from 'lucide-react';
import { BookingModal } from './booking/BookingModal';
import { QuoteRequestModal } from './quote/QuoteRequestModal';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import {
  useDeviceCategories,
  useDeviceBrands,
  useDeviceModels,
  useDeviceParts,
  useDeviceCategory,
  useDeviceBrand,
  useDeviceModel,
  useDeviceBrandByName,
  useDeviceCategoryByName,
  useDeviceCategoryBySlug,
  useDeviceBrandBySlug,
  useDeviceModelBySlug,
} from '@/hooks/useRepairQueries';
import { useLanguage } from "@/contexts/LanguageContext";
import { generateSlug } from '@/lib/utils';

type DeviceCategory = Tables<'device_categories'>;
type DeviceBrand = Tables<'device_brands'>;
type DeviceModel = Tables<'device_models'>;
type DevicePart = Tables<'device_parts'>;
type PartPricing = Tables<'part_pricing'>;

interface PartWithPricing extends DevicePart {
  pricing: PartPricing[];
}

type NavigationLevel = 'categories' | 'brands' | 'models' | 'parts';

interface NavigationState {
  level: NavigationLevel;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
}

const iconMap = {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
};

export const HierarchicalRepairsGrid: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Get URL parameters (now using slugs)
  const categorySlug = searchParams.get('category');
  const brandSlug = searchParams.get('brand');
  const modelSlug = searchParams.get('model');
  
  // Try to resolve slug-based parameters to entities
  const categoryBySlugQuery = useDeviceCategoryBySlug(categorySlug);
  const brandBySlugQuery = useDeviceBrandBySlug(brandSlug);
  const modelBySlugQuery = useDeviceModelBySlug(modelSlug);
  
  // Initialize navigation state from URL parameters
  const getNavigationFromURL = (): NavigationState => {
    // Use resolved entities from slug lookups
    const resolvedCategoryId = categoryBySlugQuery.data?.id;
    const resolvedBrandId = brandBySlugQuery.data?.id;
    const resolvedModelId = modelBySlugQuery.data?.id;
    
    // If we have URL parameters, use them even if queries are loading
    if (modelSlug) {
      return { 
        level: 'parts', 
        categoryId: resolvedCategoryId, 
        brandId: resolvedBrandId, 
        modelId: resolvedModelId 
      };
    } else if (brandSlug) {
      return { 
        level: 'models', 
        categoryId: resolvedCategoryId, 
        brandId: resolvedBrandId 
      };
    } else if (categorySlug) {
      return { 
        level: 'brands', 
        categoryId: resolvedCategoryId 
      };
    } else {
      return { level: 'categories' };
    }
  };

  const [navigation, setNavigation] = useState<NavigationState>(getNavigationFromURL());
  const [transitioning, setTransitioning] = useState(false);

  // TanStack Query hooks
  const categoriesQuery = useDeviceCategories();
  const brandsQuery = useDeviceBrands(navigation.categoryId);
  const modelsQuery = useDeviceModels(navigation.brandId);
  const partsQuery = useDeviceParts(navigation.modelId);
  
  // Individual entity queries for breadcrumb
  const categoryQuery = useDeviceCategory(navigation.categoryId);
  const brandQuery = useDeviceBrand(navigation.brandId);
  const modelQuery = useDeviceModel(navigation.modelId);

  // Update navigation when URL changes or when slug lookups resolve
  useEffect(() => {
    const newNavigation = getNavigationFromURL();
    // Only update if there's a meaningful change
    if (JSON.stringify(newNavigation) !== JSON.stringify(navigation)) {
      setNavigation(newNavigation);
    }
  }, [searchParams, categoryBySlugQuery.data, brandBySlugQuery.data, modelBySlugQuery.data, categoryBySlugQuery.isLoading, brandBySlugQuery.isLoading, modelBySlugQuery.isLoading]);

  // Update URL when navigation state changes (now using slugs)
  const updateURL = (newNavigation: NavigationState, categoryName?: string, brandName?: string, modelName?: string) => {
    const params = new URLSearchParams();
    
    if (newNavigation.categoryId && categoryName) {
      params.set('category', generateSlug(categoryName));
    }
    if (newNavigation.brandId && brandName) {
      params.set('brand', generateSlug(brandName));
    }
    if (newNavigation.modelId && modelName) {
      params.set('model', generateSlug(modelName));
    }
    
    setSearchParams(params, { replace: true });
  };

  const navigateToCategory = (category: DeviceCategory) => {
    setTransitioning(true);
    
    // Immediately update navigation state
    const newNavigation = {
      level: 'brands' as const,
      categoryId: category.id,
    };
    setNavigation(newNavigation);
    
    // Then update URL
    updateURL(newNavigation, category.name);
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateToBrand = (brand: DeviceBrand) => {
    setTransitioning(true);
    
    // Immediately update navigation state
    const newNavigation = {
      ...navigation,
      level: 'models' as const,
      brandId: brand.id,
    };
    setNavigation(newNavigation);
    
    // Then update URL
    updateURL(newNavigation, categoryQuery.data?.name, brand.name);
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateToModel = (model: DeviceModel) => {
    setTransitioning(true);
    
    // Immediately update navigation state
    const newNavigation = {
      ...navigation,
      level: 'parts' as const,
      modelId: model.id,
    };
    setNavigation(newNavigation);
    
    // Then update URL
    updateURL(newNavigation, categoryQuery.data?.name, brandQuery.data?.name, model.name);
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateBack = () => {
    setTransitioning(true);
    let newNavigation: NavigationState;
    
    switch (navigation.level) {
      case 'brands':
        newNavigation = { level: 'categories' };
        setNavigation(newNavigation);
        updateURL(newNavigation);
        break;
      case 'models':
        newNavigation = {
          level: 'brands',
          categoryId: navigation.categoryId,
        };
        setNavigation(newNavigation);
        updateURL(newNavigation, categoryQuery.data?.name);
        break;
      case 'parts':
        newNavigation = {
          level: 'models',
          categoryId: navigation.categoryId,
          brandId: navigation.brandId,
        };
        setNavigation(newNavigation);
        updateURL(newNavigation, categoryQuery.data?.name, brandQuery.data?.name);
        break;
    }
    setTimeout(() => setTransitioning(false), 50);
  };

  // Navigation functions for breadcrumb
  const navigateToCategories = () => {
    const newNavigation = { level: 'categories' as const };
    setNavigation(newNavigation);
    updateURL(newNavigation);
  };

  const navigateToCategoryBrands = () => {
    if (navigation.categoryId) {
      const newNavigation = {
        level: 'brands' as const,
        categoryId: navigation.categoryId,
      };
      setNavigation(newNavigation);
      updateURL(newNavigation, categoryQuery.data?.name);
    }
  };

  const navigateToBrandModels = () => {
    if (navigation.categoryId && navigation.brandId) {
      const newNavigation = {
        level: 'models' as const,
        categoryId: navigation.categoryId,
        brandId: navigation.brandId,
      };
      setNavigation(newNavigation);
      updateURL(newNavigation, categoryQuery.data?.name, brandQuery.data?.name);
    }
  };

  const renderBreadcrumb = () => {
    const breadcrumbItems = [];
    
    // Always show "Repairs" as the root
    breadcrumbItems.push({
      label: 'Repairs',
      onClick: navigateToCategories,
      isActive: navigation.level === 'categories'
    });
    
    if (categoryQuery.data) {
      breadcrumbItems.push({
        label: categoryQuery.data.name,
        onClick: navigateToCategoryBrands,
        isActive: navigation.level === 'brands'
      });
    }
    
    if (brandQuery.data) {
      breadcrumbItems.push({
        label: brandQuery.data.name,
        onClick: navigateToBrandModels,
        isActive: navigation.level === 'models'
      });
    }
    
    if (modelQuery.data) {
      breadcrumbItems.push({
        label: modelQuery.data.name,
        onClick: undefined,
        isActive: navigation.level === 'parts'
      });
    }

    return breadcrumbItems.length > 1 ? (
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 py-3 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              className="p-1 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                
                {item.onClick ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    className={`p-1 h-auto hover:text-primary transition-colors ${
                      item.isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <span className="text-foreground font-medium">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    ) : null;
  };

  const renderCategories = () => {
    if (categoriesQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (categoriesQuery.isError) {
      toast.error('Failed to load device categories');
      return <div className="text-center py-8 text-muted-foreground">
        Failed to load categories
      </div>;
    }

    const categories = categoriesQuery.data || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => {
          const IconComponent = iconMap[category.icon_name as keyof typeof iconMap] || Smartphone;
          
          return (
            <Card 
              key={category.id}
              className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigateToCategory(category)}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <IconComponent className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm text-center">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderBrands = () => {
    if (brandsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (brandsQuery.isError) {
      toast.error('Failed to load device brands');
      return <div className="text-center py-8 text-muted-foreground">Failed to load brands</div>;
    }

    const brands = brandsQuery.data || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand, index) => (
          <Card 
            key={brand.id}
            className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigateToBrand(brand)}
          >
            <CardHeader className="text-center pb-4">
              {brand.logo_url && (
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white p-2">
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {!brand.logo_url && (
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <span className="text-white font-bold text-xl">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {brand.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm text-center">
                {brand.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderModels = () => {
    if (modelsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-32 w-24 bg-muted rounded-lg mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (modelsQuery.isError) {
      toast.error('Failed to load device models');
      return <div className="text-center py-8 text-muted-foreground">Failed to load models</div>;
    }

    const models = modelsQuery.data || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model, index) => (
          <Card 
            key={model.id}
            className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigateToModel(model)}
          >
            <CardHeader className="text-center pb-4">
              {model.image_url && (
                <div className="w-24 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={model.image_url} 
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!model.image_url && (
                <div className="w-24 h-32 mx-auto mb-4 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {model.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {model.name}
              </CardTitle>
              {model.release_year && (
                <Badge variant="secondary" className="mt-2">
                  {model.release_year}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm text-center">
                {model.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderParts = () => {
    if (partsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-12 w-12 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (partsQuery.isError) {
      toast.error('Failed to load device parts');
      return <div className="text-center py-8 text-muted-foreground">Failed to load parts</div>;
    }

    const parts = partsQuery.data || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part, index) => (
          <Card 
            key={part.id}
            className="group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                {part.image_url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={part.image_url} 
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {part.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{part.category}</Badge>
                    {part.difficulty_level && (
                      <Badge 
                        variant={
                          part.difficulty_level === 'easy' ? 'default' : 
                          part.difficulty_level === 'medium' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {part.difficulty_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {part.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {part.description}
                </p>
              )}

              {part.pricing && part.pricing.length > 0 && (
                <div className="space-y-3">
                  {part.pricing.map((pricing, pricingIndex) => (
                    <div key={pricingIndex} className="border border-border/40 rounded-lg p-3 hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              pricing.quality_type === 'original' ? 'default' : 
                              pricing.quality_type === 'oem' ? 'secondary' : 'outline'
                            }
                            className="text-xs font-medium"
                          >
                            {pricing.quality_type.charAt(0).toUpperCase() + pricing.quality_type.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            ${pricing.total_cost || (pricing.price + (pricing.labor_cost || 0))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {part.estimated_duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{part.estimated_duration}</span>
                            </div>
                          )}
                          {part.warranty_period && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span>{part.warranty_period}</span>
                            </div>
                          )}
                        </div>
                        
                        <BookingModal
                          selectedPart={{
                            id: part.id,
                            name: part.name,
                            category: part.category,
                            model: modelQuery.data?.name || '',
                            brand: brandQuery.data?.name || '',
                            device_type: categoryQuery.data?.name || '',
                            quality_type: pricing.quality_type,
                            price: pricing.total_cost || (pricing.price + (pricing.labor_cost || 0)),
                            estimated_duration: part.estimated_duration || ''
                          }}
                        >
                          <Button size="sm" className="text-xs px-3 py-1 h-7">
                            Select
                          </Button>
                        </BookingModal>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!part.pricing || part.pricing.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">Contact for pricing</p>
                  <QuoteRequestModal
                    deviceCategoryId={navigation.categoryId}
                    deviceBrandId={navigation.brandId}
                    deviceModelId={navigation.modelId}
                    devicePartId={part.id}
                  >
                    <Button size="sm" variant="outline">
                      Get Quote
                    </Button>
                  </QuoteRequestModal>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Check if any query is loading
  const isLoading = categoriesQuery.isLoading || 
    (navigation.level === 'brands' && brandsQuery.isLoading) ||
    (navigation.level === 'models' && modelsQuery.isLoading) ||
    (navigation.level === 'parts' && partsQuery.isLoading);

  // Generate dynamic SEO content based on navigation state
  const getDynamicSEO = () => {
    const baseTitle = t('seo.titles.repairs');
    const baseDescription = t('seo.descriptions.repairs');
    const baseKeywords = t('seo.keywords.repairs');
    
    switch (navigation.level) {
      case 'categories':
        return {
          title: t('seo.templates.categoryTitle', { category: t('seo.titles.categories') }),
          description: t('seo.descriptions.categories'),
          keywords: t('seo.keywords.categories')
        };
      
      case 'brands':
        const categoryName = categoryQuery.data?.name;
        if (categoryName) {
          return {
            title: t('seo.templates.brandTitle', { 
              brand: categoryName,
              category: t('seo.titles.brands')
            }),
            description: t('seo.templates.brandDescription', {
              brand: categoryName,
              category: categoryName.toLowerCase()
            }),
            keywords: `${categoryName?.toLowerCase()} ${t('seo.keywords.brands')}`
          };
        }
        return {
          title: t('seo.titles.brands'),
          description: t('seo.descriptions.brands'),
          keywords: t('seo.keywords.brands')
        };
      
      case 'models':
        const brandName = brandQuery.data?.name;
        const categoryNameForModels = categoryQuery.data?.name;
        if (brandName && categoryNameForModels) {
          return {
            title: t('seo.templates.brandTitle', {
              brand: brandName,
              category: categoryNameForModels
            }),
            description: t('seo.templates.brandDescription', {
              brand: brandName,
              category: categoryNameForModels.toLowerCase()
            }),
            keywords: `${brandName} ${t('seo.keywords.models')}`
          };
        }
        return {
          title: t('seo.titles.models'),
          description: t('seo.descriptions.models'),
          keywords: t('seo.keywords.models')
        };
      
      case 'parts':
        const modelName = modelQuery.data?.name;
        const brandNameForParts = brandQuery.data?.name;
        if (brandNameForParts && modelName) {
          return {
            title: t('seo.templates.modelTitle', {
              brand: brandNameForParts,
              model: modelName
            }),
            description: t('seo.templates.modelDescription', {
              brand: brandNameForParts,
              model: modelName
            }),
            keywords: `${brandNameForParts} ${modelName} ${t('seo.keywords.parts')}`
          };
        }
        return {
          title: t('seo.titles.parts'),
          description: t('seo.descriptions.parts'),
          keywords: t('seo.keywords.parts')
        };
      
      default:
        return {
          title: baseTitle,
          description: baseDescription,
          keywords: baseKeywords
        };
    }
  };

  const dynamicSEO = getDynamicSEO();

  // Generate breadcrumb structured data
  const getBreadcrumbItems = () => {
    const items = [
      { name: "Home", url: "https://phoneHub.com/" },
      { name: "Repairs", url: "https://phoneHub.com/repairs" }
    ];

    if (categoryQuery.data) {
      items.push({
        name: categoryQuery.data.name,
        url: `https://phoneHub.com/repairs?category=${generateSlug(categoryQuery.data.name)}`
      });
    }

    if (brandQuery.data && categoryQuery.data) {
      items.push({
        name: brandQuery.data.name,
        url: `https://phoneHub.com/repairs?category=${generateSlug(categoryQuery.data.name)}&brand=${generateSlug(brandQuery.data.name)}`
      });
    }

    if (modelQuery.data && brandQuery.data && categoryQuery.data) {
      items.push({
        name: modelQuery.data.name,
        url: `https://phoneHub.com/repairs?category=${generateSlug(categoryQuery.data.name)}&brand=${generateSlug(brandQuery.data.name)}&model=${generateSlug(modelQuery.data.name)}`
      });
    }

    return items;
  };

  return (
    <>
      <SEO 
        title={dynamicSEO.title}
        description={dynamicSEO.description}
        keywords={dynamicSEO.keywords}
        canonical={window.location.href}
      />
      
      {/* Add breadcrumb structured data */}
      <BreadcrumbStructuredData items={getBreadcrumbItems()} />
      
      {/* Add service-specific structured data for parts level */}
      {navigation.level === 'parts' && modelQuery.data && brandQuery.data && (
        <ServiceStructuredData 
          name={`${brandQuery.data.name} ${modelQuery.data.name} Repair Services`}
          description={`Professional repair services for ${brandQuery.data.name} ${modelQuery.data.name}. Screen replacement, battery repair, and component fixes with warranty.`}
          provider="Blueprint Phone Zen"
          serviceType="Mobile Device Repair"
          areaServed="Worldwide"
          availableChannel={{
            url: window.location.href,
            name: "Online Repair Booking"
          }}
        />
      )}
      
      {renderBreadcrumb()}
      
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {navigation.level === 'categories' && 'Select Device Type'}
            {navigation.level === 'brands' && `${categoryQuery.data?.name || 'Device'} Brands`}
            {navigation.level === 'models' && `${brandQuery.data?.name || 'Brand'} Models`}
            {navigation.level === 'parts' && `${modelQuery.data?.name || 'Model'} Parts`}
          </h2>
          <p className="text-muted-foreground">
            {navigation.level === 'categories' && 'Choose the type of device you need repaired'}
            {navigation.level === 'brands' && 'Select your device brand'}
            {navigation.level === 'models' && 'Choose your device model'}
            {navigation.level === 'parts' && 'Select the part you need repaired and choose quality option'}
          </p>
        </div>

        <div className={`transition-all duration-200 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
          {navigation.level === 'categories' && renderCategories()}
          {navigation.level === 'brands' && renderBrands()}
          {navigation.level === 'models' && renderModels()}
          {navigation.level === 'parts' && renderParts()}
        </div>
      </div>
    </>
  );
};

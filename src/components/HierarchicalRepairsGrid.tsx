import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    // Check if we have URL parameters but queries are still loading
    if (categorySlug && categoryBySlugQuery.isLoading) {
      return { level: 'categories' }; // Wait for category to load
    }
    if (brandSlug && brandBySlugQuery.isLoading) {
      return { level: 'brands', categoryId: categoryBySlugQuery.data?.id }; // Wait for brand to load
    }
    if (modelSlug && modelBySlugQuery.isLoading) {
      return { level: 'models', categoryId: categoryBySlugQuery.data?.id, brandId: brandBySlugQuery.data?.id }; // Wait for model to load
    }
    
    // Use resolved entities from slug lookups
    const resolvedCategoryId = categoryBySlugQuery.data?.id;
    const resolvedBrandId = brandBySlugQuery.data?.id;
    const resolvedModelId = modelBySlugQuery.data?.id;
    
    if (resolvedModelId) {
      return { level: 'parts', categoryId: resolvedCategoryId, brandId: resolvedBrandId, modelId: resolvedModelId };
    } else if (resolvedBrandId) {
      return { level: 'models', categoryId: resolvedCategoryId, brandId: resolvedBrandId };
    } else if (resolvedCategoryId) {
      return { level: 'brands', categoryId: resolvedCategoryId };
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
    setNavigation(newNavigation);
  }, [searchParams, categoryBySlugQuery.data, brandBySlugQuery.data, modelBySlugQuery.data]);

  // Update URL when navigation state changes
  const updateURL = (newNavigation: NavigationState) => {
    const params = new URLSearchParams();
    
    // Get the current entities to generate slugs
    const category = categoryQuery.data;
    const brand = brandQuery.data;
    const model = modelQuery.data;
    
    if (newNavigation.categoryId && category) {
      params.set('category', generateSlug(category.name));
    }
    if (newNavigation.brandId && brand) {
      params.set('brand', generateSlug(brand.name));
    }
    if (newNavigation.modelId && model) {
      params.set('model', generateSlug(model.name));
    }
    
    setSearchParams(params, { replace: true });
    setNavigation(newNavigation);
  };

  const navigateToCategory = (category: DeviceCategory) => {
    setTransitioning(true);
    const params = new URLSearchParams();
    // Use slug if available, otherwise generate from name
    const slug = (category as any).slug || generateSlug(category.name);
    params.set('category', slug);
    setSearchParams(params, { replace: true });
    setNavigation({
      level: 'brands',
      categoryId: category.id,
    });
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateToBrand = (brand: DeviceBrand) => {
    setTransitioning(true);
    const params = new URLSearchParams();
    if (navigation.categoryId && categoryQuery.data) {
      const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
      params.set('category', categorySlug);
    }
    const brandSlug = (brand as any).slug || generateSlug(brand.name);
    params.set('brand', brandSlug);
    setSearchParams(params, { replace: true });
    setNavigation({
      ...navigation,
      level: 'models',
      brandId: brand.id,
    });
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateToModel = (model: DeviceModel) => {
    setTransitioning(true);
    const params = new URLSearchParams();
    if (navigation.categoryId && categoryQuery.data) {
      const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
      params.set('category', categorySlug);
    }
    if (navigation.brandId && brandQuery.data) {
      const brandSlug = (brandQuery.data as any).slug || generateSlug(brandQuery.data.name);
      params.set('brand', brandSlug);
    }
    const modelSlug = (model as any).slug || generateSlug(model.name);
    params.set('model', modelSlug);
    setSearchParams(params, { replace: true });
    setNavigation({
      ...navigation,
      level: 'parts',
      modelId: model.id,
    });
    setTimeout(() => setTransitioning(false), 50);
  };

  const navigateBack = () => {
    setTransitioning(true);
    const params = new URLSearchParams();
    
    switch (navigation.level) {
      case 'brands':
        setSearchParams(params, { replace: true });
        setNavigation({ level: 'categories' });
        break;
      case 'models':
        if (navigation.categoryId && categoryQuery.data) {
          const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
          params.set('category', categorySlug);
        }
        setSearchParams(params, { replace: true });
        setNavigation({
          level: 'brands',
          categoryId: navigation.categoryId,
        });
        break;
      case 'parts':
        if (navigation.categoryId && categoryQuery.data) {
          const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
          params.set('category', categorySlug);
        }
        if (navigation.brandId && brandQuery.data) {
          const brandSlug = (brandQuery.data as any).slug || generateSlug(brandQuery.data.name);
          params.set('brand', brandSlug);
        }
        setSearchParams(params, { replace: true });
        setNavigation({
          level: 'models',
          categoryId: navigation.categoryId,
          brandId: navigation.brandId,
        });
        break;
    }
    setTimeout(() => setTransitioning(false), 50);
  };

  // Navigation functions for breadcrumb
  const navigateToCategories = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setNavigation({ level: 'categories' });
  };

  const navigateToCategoryBrands = () => {
    if (navigation.categoryId && categoryQuery.data) {
      const params = new URLSearchParams();
      const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
      params.set('category', categorySlug);
      setSearchParams(params, { replace: true });
      setNavigation({
        level: 'brands',
        categoryId: navigation.categoryId,
      });
    }
  };

  const navigateToBrandModels = () => {
    if (navigation.categoryId && navigation.brandId && categoryQuery.data && brandQuery.data) {
      const params = new URLSearchParams();
      const categorySlug = (categoryQuery.data as any).slug || generateSlug(categoryQuery.data.name);
      const brandSlug = (brandQuery.data as any).slug || generateSlug(brandQuery.data.name);
      params.set('category', categorySlug);
      params.set('brand', brandSlug);
      setSearchParams(params, { replace: true });
      setNavigation({
        level: 'models',
        categoryId: navigation.categoryId,
        brandId: navigation.brandId,
      });
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
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 py-2 sm:py-3 mb-4 sm:mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              className="p-1 h-auto flex-shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 sm:mx-2 text-muted-foreground flex-shrink-0" />}
                
                {item.onClick ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    className={`p-1 h-auto hover:text-primary transition-colors flex-shrink-0 ${
                      item.isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="truncate max-w-[100px] sm:max-w-none">{item.label}</span>
                  </Button>
                ) : (
                  <span className="text-foreground font-medium flex-shrink-0">
                    <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded-full mx-auto mb-2 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mx-auto hidden sm:block"></div>
              </CardHeader>
              <CardContent className="hidden sm:block">
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
      return <div className="text-center py-8 text-muted-foreground">Failed to load categories</div>;
    }

    const categories = categoriesQuery.data || [];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category, index) => {
          const IconComponent = iconMap[category.icon_name as keyof typeof iconMap] || Smartphone;
          
          return (
            <Card 
              key={category.id}
              className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigateToCategory(category)}
            >
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <CardTitle className="text-sm sm:text-lg lg:text-xl group-hover:text-primary transition-colors hidden sm:block">
                  {category.name}
                </CardTitle>
              </CardHeader>
              
            </Card>
          );
        })}
      </div>
    );
  };

  const renderBrands = () => {
    if (brandsQuery.isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 bg-muted rounded-full mx-auto mb-2 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mx-auto hidden sm:block"></div>
              </CardHeader>
              <CardContent className="hidden sm:block">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {brands.map((brand, index) => (
          <Card 
            key={brand.id}
            className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigateToBrand(brand)}
          >
            <CardHeader className="text-center pb-2 sm:pb-4">
              {brand.logo_url && (
                <div className=" mx-auto mb-2 sm:mb-3 lg:mb-4 overflow-hidden bg-white p-1 sm:p-2">
                  <img 
                    src={brand.logo_url} 
                    alt={brand.name}
                    className="w-full h-full object-contain aspect-square"
                  />
                </div>
              )}
              {!brand.logo_url && (
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-2 sm:mb-3 lg:mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
              
            </CardHeader>
            
          </Card>
        ))}
      </div>
    );
  };

  const renderModels = () => {
    if (modelsQuery.isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="h-16 w-12 sm:h-20 sm:w-16 lg:h-24 lg:w-20 bg-muted rounded-lg mx-auto mb-2 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mx-auto hidden sm:block"></div>
              </CardHeader>
              <CardContent className="hidden sm:block">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {models.map((model, index) => (
          <Card 
            key={model.id}
            className="cursor-pointer group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigateToModel(model)}
          >
            <CardHeader className="text-center pb-2 sm:pb-4">
              {model.image_url && (
                <div className=" mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={model.image_url} 
                    alt={model.name}
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
              )}
              {!model.image_url && (
                <div className="w-16 h-20 sm:w-20 sm:h-28 lg:w-24 lg:h-32 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg lg:text-xl">
                    {model.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              <CardTitle className="text-sm sm:text-lg lg:text-xl group-hover:text-primary transition-colors hidden sm:block">
                {model.name}
              </CardTitle>
              {model.release_year && (
                <Badge variant="secondary" className="mt-2 hidden sm:inline-flex">
                  {model.release_year}
                </Badge>
              )}
            </CardHeader>
           
          </Card>
        ))}
      </div>
    );
  };

  const renderParts = () => {
    if (partsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
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

    // Ensure parts are sorted by display_order (should already be sorted by the query)
    const sortedParts = [...parts].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedParts.map((part, index) => (
          <Card 
            key={part.id}
            className="group bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4 sm:gap-6">
                {part.image_url ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={part.image_url} 
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-2">
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
    (navigation.level === 'parts' && partsQuery.isLoading) ||
    categoryBySlugQuery.isLoading ||
    brandBySlugQuery.isLoading ||
    modelBySlugQuery.isLoading;

  return (
    <>
      {renderBreadcrumb()}
      
      <div className="space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            {navigation.level === 'categories' && 'Select Device Type'}
            {navigation.level === 'brands' && `${categoryQuery.data?.name || 'Device'} Brands`}
            {navigation.level === 'models' && `${brandQuery.data?.name || 'Brand'} Models`}
            {navigation.level === 'parts' && `${modelQuery.data?.name || 'Model'} Parts`}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            {navigation.level === 'categories' && 'Choose the type of device you need repaired'}
            {navigation.level === 'brands' && 'Select your device brand'}
            {navigation.level === 'models' && 'Choose your device model'}
            {navigation.level === 'parts' && 'Select the part you need repaired and choose quality option'}
          </p>
        </div>

        <div className={`transition-all duration-200 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {navigation.level === 'categories' && renderCategories()}
              {navigation.level === 'brands' && renderBrands()}
              {navigation.level === 'models' && renderModels()}
              {navigation.level === 'parts' && renderParts()}
            </>
          )}
        </div>
      </div>
    </>
  );
};

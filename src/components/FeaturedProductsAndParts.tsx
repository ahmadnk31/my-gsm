import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Wrench, ShoppingCart, ArrowRight, Zap, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPriceToEuro } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

// Lazy load the BookingModal
const BookingModal = lazy(() => import('./booking/BookingModal').then(module => ({ default: module.BookingModal })));

// Fallback component for lazy-loaded modal
const ModalFallback = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <div onClick={onClick}>{children}</div>
);

type DevicePart = Tables<'device_parts'>;
type PartPricing = Tables<'part_pricing'>;
type DeviceModel = Tables<'device_models'>;
type DeviceBrand = Tables<'device_brands'>;
type DeviceCategory = Tables<'device_categories'>;

interface AccessoryProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  features: string[];
  category_name?: string;
  slug: string;
}

interface PopularRepairPart extends DevicePart {
  pricing: PartPricing[];
  device_model: DeviceModel;
  device_brand: DeviceBrand;
  device_category: DeviceCategory;
  min_price: number;
  max_price: number;
  popularity_score: number;
}

interface RepairPart {
  id: string;
  name: string;
  description?: string;
  category: string;
  model_name: string;
  brand_name: string;
  device_type: string;
  estimated_duration?: string;
  image_url?: string;
  min_price: number;
  max_price: number;
  price_range: string;
  popularity_score: number;
}

const FeaturedProductsAndParts: React.FC = () => {
  const { t } = useLanguage();

  // Fetch featured accessories
  const { data: featuredAccessories, isLoading: accessoriesLoading } = useQuery({
    queryKey: ['featured-accessories-homepage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accessories')
        .select(`
          id,
          name,
          price,
          original_price,
          image_url,
          rating,
          review_count,
          is_featured,
          features,
          slug,
          accessory_categories (name)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as AccessoryProduct[];
    },
  });

  // Fetch popular repair parts from real database using the correct schema
  const { data: popularParts, isLoading: partsLoading } = useQuery({
    queryKey: ['popular-device-parts-homepage'],
    queryFn: async (): Promise<RepairPart[]> => {
      // Get device parts with their models, brands, categories, and pricing
      const { data: parts, error } = await supabase
        .from('device_parts')
        .select(`
          *,
          device_models!inner (
            id,
            name,
            image_url,
            device_brands!inner (
              id,
              name,
              logo_url,
              device_categories!inner (
                id,
                name,
                icon
              )
            )
          ),
          part_pricing (
            id,
            price,
            quality_type,
            availability_status,
            labor_cost,
            total_cost
          )
        `)
        .eq('is_active', true)
        .eq('device_models.is_active', true)
        .eq('device_models.device_brands.is_active', true)
        .eq('device_models.device_brands.device_categories.is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching device parts:', error);
        // Return fallback data
        return [
          {
            id: '1',
            name: 'iPhone Screen Replacement',
            category: 'Screen Repair',
            model_name: 'iPhone',
            brand_name: 'Apple',
            device_type: 'Smartphone',
            estimated_duration: '30-60 min',
            image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
            min_price: 89,
            max_price: 299,
            price_range: '€89 - €299',
            popularity_score: 95
          },
          {
            id: '2',
            name: 'Samsung Battery Replacement',
            category: 'Battery Replacement',
            model_name: 'Galaxy S24',
            brand_name: 'Samsung',
            device_type: 'Smartphone',
            estimated_duration: '45-90 min',
            image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop',
            min_price: 69,
            max_price: 149,
            price_range: '€69 - €149',
            popularity_score: 87
          }
        ] as RepairPart[];
      }

      // Transform the data
      const transformedParts: RepairPart[] = parts.map((part: any, index) => {
        const pricing = part.part_pricing || [];
        const prices = pricing
          .map((p: any) => p.total_cost || p.price)
          .filter((p: any) => p > 0);
        
        const minPrice = prices.length > 0 ? Math.min(...prices) : 50;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 200;

        return {
          id: part.id,
          name: part.name,
          description: part.description,
          category: part.category,
          model_name: part.device_models?.name || 'Unknown Model',
          brand_name: part.device_models?.device_brands?.name || 'Unknown Brand',
          device_type: part.device_models?.device_brands?.device_categories?.name || 'Device',
          estimated_duration: part.estimated_duration,
          image_url: part.image_url || part.device_models?.image_url || part.device_models?.device_brands?.logo_url,
          min_price: minPrice,
          max_price: maxPrice,
          price_range: `€${minPrice}${minPrice !== maxPrice ? ` - €${maxPrice}` : ''}`,
          popularity_score: Math.max(60, 95 - (index * 4))
        };
      });

      return transformedParts;
    },
  });

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-success/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Featured Accessories Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <Award className="h-4 w-4" />
              <span>Featured Products</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Premium Accessories
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover our top-rated accessories and protection solutions for your devices
            </p>
          </div>

          {/* Accessories Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-12">
            {accessoriesLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`${index === 0 ? 'md:col-span-3' : index === 1 ? 'md:col-span-3' : 'md:col-span-2'} animate-pulse`}>
                  <div className="bg-muted rounded-2xl h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-3 w-2/3"></div>
                </div>
              ))
            ) : (
              featuredAccessories?.map((product, index) => {
                const getBentoClasses = (index: number) => {
                  const patterns = [
                    "md:col-span-3", // Large
                    "md:col-span-3", // Large
                    "md:col-span-2", // Standard
                    "md:col-span-2", // Standard
                    "md:col-span-2", // Standard
                    "md:col-span-6", // Full width
                  ];
                  return patterns[index] || "md:col-span-2";
                };

                const isLarge = index < 2;
                const isFullWidth = index === 5;

                return (
                  <Card key={product.id} className={`group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${getBentoClasses(index)}`}>
                    <div className="relative">
                      <div className={`${isLarge ? 'h-80' : isFullWidth ? 'h-64' : 'h-64'} relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden`}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                        </div>
                        
                        {product.original_price && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-red-500 text-white">
                              -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className={`${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between`}>
                      <div>
                        <h3 className={`${isLarge ? 'text-xl' : 'text-lg'} font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors`}>
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({product.review_count})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold text-primary`}>
                            {formatPriceToEuro(product.price)}
                          </span>
                          {product.original_price && (
                            <span className="text-muted-foreground line-through text-sm">
                              {formatPriceToEuro(product.original_price)}
                            </span>
                          )}
                        </div>

                        {product.features && product.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.features.slice(0, isLarge ? 3 : 2).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button asChild className="w-full mt-4 group/btn">
                        <Link to={`/accessories/product?slug=${product.slug}`} className="flex items-center justify-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add to Cart</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/accessories" className="flex items-center gap-2">
                <span>View All Accessories</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Most Repaired Parts Section */}
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-success/80 text-success-foreground px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-elegant">
              <TrendingUp className="h-4 w-4" />
              <span>Popular Repairs</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Most Requested Services
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our most popular repair services with transparent pricing and quick turnaround times
            </p>
          </div>

          {/* Repair Parts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partsLoading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-2xl h-48 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-3 w-2/3 mb-2"></div>
                  <div className="bg-muted rounded h-3 w-1/2"></div>
                </div>
              ))
            ) : (
              popularParts?.map((part, index) => (
                <Card key={part.id} className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <div className="h-48 relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-t-xl">
                      <img
                        src={part.image_url}
                        alt={part.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-success/90 text-white text-xs">
                          #{index + 1} Popular
                        </Badge>
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                          <Wrench className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs mb-2">
                        {part.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {part.name}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold text-primary">{part.price_range}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{part.estimated_duration || '60 min'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Demand:</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="font-medium text-success">{part.popularity_score}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-3">
                        Compatible: {part.model_name} ({part.brand_name})
                      </p>
                      
                      <Suspense fallback={
                        <ModalFallback>
                          <Button size="sm" className="w-full">
                            <Zap className="h-3 w-3 mr-2" />
                            Book Repair
                          </Button>
                        </ModalFallback>
                      }>
                        <BookingModal
                          selectedPart={{
                            id: part.id,
                            name: part.name,
                            category: part.category,
                            model: part.model_name,
                            brand: part.brand_name,
                            device_type: part.device_type,
                            quality_type: 'Standard',
                            price: part.min_price,
                            estimated_duration: part.estimated_duration || '60 min'
                          }}
                        >
                          <Button size="sm" className="w-full group/btn">
                            <Zap className="h-3 w-3 mr-2" />
                            <span>Book Repair</span>
                            <ArrowRight className="h-3 w-3 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </Button>
                        </BookingModal>
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/repairs" className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  <span>Book a Repair</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline">
                <Link to="/accessories" className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Shop Accessories</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsAndParts;

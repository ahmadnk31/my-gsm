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
  booking_count?: number;
  // Store original data for BookingModal
  _originalPart?: any;
  _originalModel?: any;
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

  // Fetch most requested repair parts based on actual bookings data
  const { data: popularParts, isLoading: partsLoading, error: partsError } = useQuery({
    queryKey: ['most-requested-repair-parts'],
    queryFn: async (): Promise<RepairPart[]> => {
      try {
        // First, get the most booked parts by counting bookings
        const { data: bookingStats, error: statsError } = await supabase
          .rpc('get_most_requested_parts', {})
          .limit(8);

        if (statsError) {
          console.log('RPC not available, using alternative approach:', statsError);
          
          // Alternative approach: Get parts with bookings count manually
          const { data: mostBookedParts, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              part_id,
              device_parts!inner (
                id,
                name,
                description,
                category,
                estimated_duration,
                image_url,
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
                      name
                    )
                  )
                ),
                part_pricing (
                  id,
                  price,
                  quality_type,
                  labor_cost,
                  total_cost,
                  availability_status
                )
              )
            `)
            .not('part_id', 'is', null)
            .order('created_at', { ascending: false });

          if (bookingsError) {
            console.log('Bookings query failed, falling back to all parts:', bookingsError);
            
            // Final fallback: Get all active parts
            const { data: allParts, error: allPartsError } = await supabase
              .from('device_parts')
              .select(`
                id,
                name,
                description,
                category,
                estimated_duration,
                image_url,
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
                      name
                    )
                  )
                ),
                part_pricing (
                  id,
                  price,
                  quality_type,
                  labor_cost,
                  total_cost,
                  availability_status
                )
              `)
              .eq('is_active', true)
              .eq('device_models.is_active', true)
              .eq('device_models.device_brands.is_active', true)
              .eq('device_models.device_brands.device_categories.is_active', true)
              .limit(8);

            if (allPartsError) {
              console.error('All queries failed:', allPartsError);
              return [];
            }

            console.log('Using all parts as fallback:', allParts?.length);
            return transformPartsData(allParts || []);
          }

          // Count occurrences and get unique parts with their booking count
          const partCounts: { [key: string]: any } = {};
          mostBookedParts?.forEach((booking: any) => {
            const partId = booking.part_id;
            if (partId && booking.device_parts) {
              if (!partCounts[partId]) {
                partCounts[partId] = {
                  part: booking.device_parts,
                  count: 0
                };
              }
              partCounts[partId].count++;
            }
          });

          // Sort by booking count and get top 8
          const sortedParts = Object.values(partCounts)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 8);

          console.log('Most booked parts:', sortedParts);
          return transformPartsData(sortedParts.map((item: any) => ({
            ...item.part,
            booking_count: item.count
          })));
        }

        console.log('Using RPC result:', bookingStats);
        return transformPartsData(bookingStats || []);
      } catch (error) {
        console.error('Error fetching popular parts:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Helper function to transform parts data
  const transformPartsData = (partsData: any[]): RepairPart[] => {
    return partsData.map((part: any, index) => {
      const pricing = part.part_pricing || [];
      const prices = pricing
        .map((p: any) => p.total_cost || (p.price + (p.labor_cost || 0)))
        .filter((p: any) => p > 0);
      
      const minPrice = prices.length > 0 ? Math.min(...prices) : 50;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 200;

      const modelData = part.device_models || {};
      const brandData = modelData.device_brands || {};
      const categoryData = brandData.device_categories || {};

      // Calculate popularity score based on booking count if available
      const bookingCount = part.booking_count || 0;
      const popularityScore = bookingCount > 0 
        ? Math.min(95, 60 + (bookingCount * 5)) 
        : Math.max(60, 95 - (index * 4));

      return {
        id: part.id,
        name: part.name,
        description: part.description,
        category: part.category,
        model_name: modelData.name || 'Unknown Model',
        brand_name: brandData.name || 'Unknown Brand',
        device_type: categoryData.name || 'Device',
        estimated_duration: part.estimated_duration || '60 min',
        image_url: part.image_url || modelData.image_url || brandData.logo_url,
        min_price: minPrice,
        max_price: maxPrice,
        price_range: minPrice === maxPrice ? `€${minPrice}` : `€${minPrice} - €${maxPrice}`,
        popularity_score: popularityScore,
        booking_count: bookingCount,
        // Store original data for BookingModal
        _originalPart: part,
        _originalModel: modelData
      };
    });
  };

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
                          className="w-full h-full object-contain aspect-square transition-transform duration-700 group-hover:scale-110"
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
            ) : popularParts && popularParts.length > 0 ? (
              popularParts.map((part, index) => (
                <Card key={part.id} className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <div className="h-full relative mx-auto">
                      <img
                        src={part.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'}
                        alt={part.name}
                        className="w-full h-full object-contain aspect-square transition-transform duration-500 group-hover:scale-105"
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
                          <span className="font-medium text-success">
                            {part.booking_count && part.booking_count > 0 
                              ? `${part.booking_count} bookings` 
                              : `${part.popularity_score}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-3">
                        Compatible: {part.model_name} ({part.brand_name})
                      </p>
                      
                      {/* Show pricing options if available */}
                      {part._originalPart?.part_pricing && part._originalPart.part_pricing.length > 0 ? (
                        <div className="space-y-2">
                          {part._originalPart.part_pricing.slice(0, 2).map((pricing: any, pricingIndex: number) => (
                            <Suspense key={pricingIndex} fallback={
                              <ModalFallback>
                                <Button size="sm" className="w-full text-xs">
                                  <Zap className="h-3 w-3 mr-2" />
                                  {pricing.quality_type} - €{pricing.total_cost || (pricing.price + (pricing.labor_cost || 0))}
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
                                  quality_type: pricing.quality_type,
                                  price: pricing.total_cost || (pricing.price + (pricing.labor_cost || 0)),
                                  estimated_duration: part.estimated_duration || '60 min'
                                }}
                              >
                                <Button size="sm" className="w-full text-xs group/btn">
                                  <Zap className="h-3 w-3 mr-1" />
                                  <span className="capitalize">{pricing.quality_type}</span>
                                  <span className="ml-auto font-bold">
                                    €{pricing.total_cost || (pricing.price + (pricing.labor_cost || 0))}
                                  </span>
                                  <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                </Button>
                              </BookingModal>
                            </Suspense>
                          ))}
                          
                          {part._originalPart.part_pricing.length > 2 && (
                            <Button asChild size="sm" variant="outline" className="w-full text-xs">
                              <Link to="/repairs" className="flex items-center justify-center gap-2">
                                <span>View all options</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      ) : (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback when no data available - show sample popular repair services
              [
                {
                  id: 'sample-1',
                  name: 'iPhone Screen Replacement',
                  category: 'Screen Repair',
                  model_name: 'iPhone 15 Pro',
                  brand_name: 'Apple',
                  device_type: 'Smartphones',
                  estimated_duration: '45 min',
                  price_range: '€95 - €250',
                  popularity_score: 95,
                  image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'
                },
                {
                  id: 'sample-2',
                  name: 'Samsung Battery Replacement',
                  category: 'Battery Replacement',
                  model_name: 'Galaxy S24',
                  brand_name: 'Samsung',
                  device_type: 'Smartphones',
                  estimated_duration: '60 min',
                  price_range: '€65 - €140',
                  popularity_score: 87,
                  image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop'
                },
                {
                  id: 'sample-3',
                  name: 'iPhone Camera Repair',
                  category: 'Camera Repair',
                  model_name: 'iPhone 14',
                  brand_name: 'Apple',
                  device_type: 'Smartphones',
                  estimated_duration: '90 min',
                  price_range: '€110 - €200',
                  popularity_score: 78,
                  image_url: 'https://images.unsplash.com/photo-1580910051103-d53f5f33a137?w=300&h=200&fit=crop'
                },
                {
                  id: 'sample-4',
                  name: 'Charging Port Repair',
                  category: 'Hardware Repair',
                  model_name: 'Universal',
                  brand_name: 'All Brands',
                  device_type: 'All Devices',
                  estimated_duration: '45 min',
                  price_range: '€50 - €90',
                  popularity_score: 82,
                  image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=200&fit=crop'
                }
              ].map((part, index) => (
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
                          <span className="font-medium">{part.estimated_duration}</span>
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
                      
                      <Button asChild size="sm" className="w-full group/btn">
                        <Link to="/repairs" className="flex items-center justify-center gap-2">
                          <Zap className="h-3 w-3" />
                          <span>Book Repair</span>
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
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

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

// Lazy load the BookingModal
const BookingModal = lazy(() => import('./booking/BookingModal').then(module => ({ default: module.BookingModal })));

// Fallback component for lazy-loaded modal
const ModalFallback = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <div onClick={onClick}>{children}</div>
);

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

interface RepairPart {
  id: string;
  name: string;
  price_range: string;
  repair_time: string;
  device_models: string[];
  popularity_score: number;
  category: string;
  image_url?: string;
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

  // Fetch most repaired parts (using curated popular repair data)
  const { data: popularParts, isLoading: partsLoading } = useQuery({
    queryKey: ['popular-repair-parts'],
    queryFn: async () => {
      // Return curated popular repair services data
      return [
        {
          id: '1',
          name: 'iPhone Screen Replacement',
          price_range: '€89 - €299',
          repair_time: '30-60 min',
          device_models: ['iPhone 14 Pro', 'iPhone 15 Pro', 'iPhone 13'],
          popularity_score: 95,
          category: 'Screen Repair',
          image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'
        },
        {
          id: '2',
          name: 'Samsung Battery Replacement',
          price_range: '€69 - €149',
          repair_time: '45-90 min',
          device_models: ['Galaxy S24', 'Galaxy S23', 'Galaxy S22'],
          popularity_score: 87,
          category: 'Battery Replacement',
          image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=200&fit=crop'
        },
        {
          id: '3',
          name: 'Camera Module Repair',
          price_range: '€99 - €199',
          repair_time: '60-120 min',
          device_models: ['iPhone 15', 'Pixel 8', 'OnePlus 11'],
          popularity_score: 78,
          category: 'Camera Repair',
          image_url: 'https://images.unsplash.com/photo-1580910051103-d53f5f33a137?w=300&h=200&fit=crop'
        },
        {
          id: '4',
          name: 'Charging Port Repair',
          price_range: '€49 - €89',
          repair_time: '30-45 min',
          device_models: ['All iPhone Models', 'All Android Models'],
          popularity_score: 82,
          category: 'Hardware Repair',
          image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=200&fit=crop'
        },
        {
          id: '5',
          name: 'Water Damage Recovery',
          price_range: '€129 - €249',
          repair_time: '2-4 hours',
          device_models: ['All Brands Supported'],
          popularity_score: 73,
          category: 'Water Damage',
          image_url: 'https://images.unsplash.com/photo-1609592062458-6c5d1f6b5b75?w=300&h=200&fit=crop'
        },
        {
          id: '6',
          name: 'Speaker Replacement',
          price_range: '€59 - €119',
          repair_time: '45-75 min',
          device_models: ['iPhone Series', 'Samsung Galaxy'],
          popularity_score: 65,
          category: 'Audio Repair',
          image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop'
        },
        {
          id: '7',
          name: 'Home Button Repair',
          price_range: '€39 - €79',
          repair_time: '20-40 min',
          device_models: ['iPhone 6-8 Series', 'iPad Models'],
          popularity_score: 71,
          category: 'Button Repair',
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
        },
        {
          id: '8',
          name: 'Back Glass Replacement',
          price_range: '€79 - €159',
          repair_time: '60-90 min',
          device_models: ['iPhone 12+', 'Samsung S20+'],
          popularity_score: 69,
          category: 'Cosmetic Repair',
          image_url: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=200&fit=crop'
        }
      ] as RepairPart[];
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
                          <span className="font-medium">{part.repair_time}</span>
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
                        Compatible: {part.device_models.slice(0, 2).join(', ')}
                        {part.device_models.length > 2 && ` +${part.device_models.length - 2} more`}
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

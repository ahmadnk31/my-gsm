import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  ShoppingCart, 
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  CheckCircle,
  Star as StarIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  Zap,
  Clock,
  Users,
  ThumbsUp
} from "lucide-react";
import { 
  useAccessoryBySlug,
  useAccessoryById,
  useRelatedAccessories,
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useAddToCart
} from '@/hooks/useAccessories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatPriceToEuro } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccessoryProduct() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const productSlug = searchParams.get('product');
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Handle both slug-based and ID-based routing
  const { data: accessoryBySlug, isLoading: isLoadingBySlug, error: errorBySlug } = useAccessoryBySlug(categorySlug, productSlug);
  const { data: accessoryById, isLoading: isLoadingById, error: errorById } = useAccessoryById(id);
  
  // Use slug-based result if available, otherwise fall back to ID-based
  const accessory = accessoryBySlug || accessoryById;
  const isLoading = isLoadingBySlug || isLoadingById;
  const error = errorBySlug || errorById;

  const { data: relatedAccessories = [] } = useRelatedAccessories(accessory?.id, accessory?.category_id, accessory?.brand_id);
  const { data: wishlistItems = [] } = useWishlist(user?.id);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const isInWishlist = wishlistItems.some(item => item.accessory_id === accessory?.id);
  const hasDiscount = accessory?.original_price && accessory.original_price > accessory.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((accessory.original_price - accessory.price) / accessory.original_price) * 100)
    : 0;

  const images = accessory?.images && Array.isArray(accessory.images) && accessory.images.length > 0
    ? accessory.images.filter((img): img is string => typeof img === 'string')
    : accessory?.image_url 
      ? [accessory.image_url]
      : [];

  const handleAddToCart = () => {
    if (!user) {
      toast.error(t('accessories.loginRequired'));
      return;
    }
    if (!accessory) {
      toast.error(t('accessories.productNotFound'));
      return;
    }

    addToCartMutation.mutate({
      userId: user.id,
      accessoryId: accessory.id,
      quantity: quantity
    });
  };

  const toggleWishlist = () => {
    if (!user) {
      toast.error(t('accessories.loginRequiredWishlist'));
      return;
    }
    if (!accessory) {
      toast.error(t('accessories.productNotFound'));
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate({
        userId: user.id,
        accessoryId: accessory.id
      });
    } else {
      addToWishlistMutation.mutate({
        userId: user.id,
        accessoryId: accessory.id
      });
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-12 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Product not found</h3>
            <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/accessories')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accessories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <li className="flex-shrink-0">
              <Link to="/" className="hover:text-foreground transition-colors">
                <span className="truncate max-w-[60px] sm:max-w-none">Home</span>
              </Link>
            </li>
            <li className="flex-shrink-0 text-muted-foreground">/</li>
            <li className="flex-shrink-0">
              <Link to="/accessories" className="hover:text-foreground transition-colors">
                <span className="truncate max-w-[80px] sm:max-w-none">Accessories</span>
              </Link>
            </li>
            <li className="flex-shrink-0 text-muted-foreground">/</li>
            <li className="flex-shrink-0">
              <Link to={`/accessories?category=${accessory.accessory_categories?.slug || 'all'}`} className="hover:text-foreground transition-colors">
                <span className="truncate max-w-[100px] sm:max-w-none">{accessory.accessory_categories?.name}</span>
              </Link>
            </li>
            <li className="flex-shrink-0 text-muted-foreground">/</li>
            <li className="text-foreground font-medium flex-shrink-0">
              <span className="truncate max-w-[120px] sm:max-w-none">{accessory.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex]}
                    alt={accessory.name}
                    className="w-full h-full object-contain aspect-square"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${accessory.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {accessory.is_featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive">
                    {discountPercentage}% OFF
                  </Badge>
                )}
                {accessory.stock_quantity <= 0 && (
                  <Badge variant="destructive">{t('accessories.outOfStock')}</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{accessory.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{accessory.rating}</span>
                  <span className="text-muted-foreground">({accessory.review_count} reviews)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {accessory.accessory_brands?.name || 'Unknown Brand'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">{formatPriceToEuro(accessory.price)}</span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPriceToEuro(accessory.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {accessory.description && (
              <div>
                <h3 className="font-semibold mb-2">{t('accessories.description')}</h3>
                <div className="text-muted-foreground leading-relaxed">
                  {isDescriptionExpanded ? (
                    <p>{accessory.description}</p>
                  ) : (
                    <p className="line-clamp-1">{accessory.description}</p>
                  )}
                  {accessory.description.length > 100 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2 transition-colors"
                    >
                      {isDescriptionExpanded ? t('accessories.readLess') : t('accessories.readMore')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {accessory.features && Array.isArray(accessory.features) && accessory.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t('accessories.keyFeatures')}</h3>
                <ul className="space-y-2">
                  {accessory.features
                    .filter((feature): feature is string => typeof feature === 'string')
                    .map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compatibility */}
            {accessory.compatibility && Array.isArray(accessory.compatibility) && accessory.compatibility.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t('accessories.compatibility')}</h3>
                <div className="flex flex-wrap gap-2">
                  {accessory.compatibility
                    .filter((device): device is string => typeof device === 'string')
                    .map((device, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {accessory.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('accessories.inStock')} ({accessory.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <Package className="h-4 w-4" />
                  <span>{t('accessories.outOfStock')}</span>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{t('accessories.quantity')}:</label>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= accessory.stock_quantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  disabled={accessory.stock_quantity <= 0 || !user}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {accessory.stock_quantity <= 0 ? t('accessories.outOfStock') : t('accessories.addToCart')}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  disabled={!user}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Free Shipping</p>
                    <p className="text-sm text-blue-700">Get it by tomorrow with same-day shipping</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warranty */}
            {accessory.warranty_months && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{accessory.warranty_months}-Month Warranty</p>
                      <p className="text-sm text-green-700">Full manufacturer warranty included</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accessory.specifications && typeof accessory.specifications === 'object' && (
                    Object.entries(accessory.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))
                  )}
                  {accessory.weight_grams && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Weight</span>
                      <span className="text-muted-foreground">{accessory.weight_grams}g</span>
                    </div>
                  )}
                  {accessory.dimensions && typeof accessory.dimensions === 'object' && (
                    Object.entries(accessory.dimensions).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium capitalize">{key}</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">Be the first to review this product!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Free standard shipping on orders over $50</li>
                      <li>• Same-day shipping for orders placed before 2 PM</li>
                      <li>• Express shipping available for additional cost</li>
                      <li>• Tracking information provided via email</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Return Policy
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 30-day return window for unused items</li>
                      <li>• Free returns for defective products</li>
                      <li>• Return shipping label provided for eligible returns</li>
                      <li>• Refund processed within 3-5 business days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedAccessories.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t('accessories.relatedProducts')}</h2>
              <Link to="/accessories" className="text-primary hover:underline">
                View All
              </Link>
            </div>
            
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {relatedAccessories.slice(0, 4).map((relatedAccessory) => (
                 <Link key={relatedAccessory.id} to={`/accessories/product?category=${relatedAccessory.accessory_categories?.slug || 'uncategorized'}&product=${relatedAccessory.slug || relatedAccessory.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        {relatedAccessory.image_url ? (
                          <img
                            src={relatedAccessory.image_url}
                            alt={relatedAccessory.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                          {relatedAccessory.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {relatedAccessory.accessory_brands?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{relatedAccessory.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">({relatedAccessory.review_count})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatPriceToEuro(relatedAccessory.price)}</span>
                          {relatedAccessory.original_price && relatedAccessory.original_price > relatedAccessory.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPriceToEuro(relatedAccessory.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

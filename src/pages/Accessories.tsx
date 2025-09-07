import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateSlug, formatPriceToEuro } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Smartphone, 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  Heart,
  Battery,
  Headphones,
  Cable,
  Shield,
  Zap,
  Laptop,
  Watch,
  Camera,
  Gamepad2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus
} from "lucide-react";
import { 
  useAccessories, 
  useAccessoryCategories,
  useAccessoryBrands,
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  useAddToCart
} from '@/hooks/useAccessories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Shield': Shield,
  'Zap': Zap,
  'Cable': Cable,
  'Headphones': Headphones,
  'Battery': Battery,
  'Laptop': Laptop,
  'Watch': Watch,
  'Camera': Camera,
  'Gamepad2': Gamepad2,
  'Smartphone': Smartphone
};

export default function Accessories() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [highlightedAccessory, setHighlightedAccessory] = useState<string | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } = useAccessoryCategories();
  const { data: brands = [], isLoading: brandsLoading } = useAccessoryBrands();
  const { data: wishlistItems = [] } = useWishlist(user?.id);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  // Handle URL parameters
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    const featured = searchParams.get('featured');
    const categoriesParam = searchParams.get('categories');
    const categoryParam = searchParams.get('category'); // Handle single category for backward compatibility
    const brandsParam = searchParams.get('brands');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const stock = searchParams.get('stock');
    const sort = searchParams.get('sort');

    if (highlight) {
      setHighlightedAccessory(highlight);
    }
    
    if (featured === 'true') {
      setFeaturedFilter(true);
    }
    
    // Handle search query first (independent of categories/brands)
    if (search) {
      setSearchQuery(search);
    }
    
    // Handle categories from URL - support both 'categories' and 'category' parameters
    let categorySlugs: string[] = [];
    if (categoriesParam) {
      categorySlugs = categoriesParam.split(',');
    } else if (categoryParam) {
      categorySlugs = [categoryParam];
    }
    
    if (categorySlugs.length > 0 && categories.length > 0) {
      const categoryIds = categorySlugs
        .map(slug => categories.find(cat => cat.slug === slug)?.id)
        .filter(Boolean);
      setSelectedCategories(categoryIds);
    }
    
    // Handle brands from URL
    if (brandsParam && brands.length > 0) {
      const brandNames = brandsParam.split(',');
      const brandIds = brandNames
        .map(name => brands.find(brand => brand.name === name)?.id)
        .filter(Boolean);
      setSelectedBrands(brandIds);
    }
    
    // Handle price range from URL
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : 1000;
      setPriceRange([min, max]);
    }
    
    // Handle rating filter from URL
    if (rating) {
      const ratingValue = parseInt(rating);
      if (ratingValue >= 1 && ratingValue <= 5) {
        setRatingFilter(ratingValue);
      }
    }
    
    // Handle stock filter from URL
    if (stock && (stock === 'in-stock' || stock === 'out-of-stock')) {
      setStockFilter(stock);
    }
    
    // Handle sort from URL
    if (sort && ['popular', 'price-low', 'price-high', 'rating', 'newest'].includes(sort)) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Handle category and brand parameters when data is loaded
  useEffect(() => {
    const categoriesParam = searchParams.get('categories');
    const categoryParam = searchParams.get('category');
    const brandsParam = searchParams.get('brands');
    
    // Handle categories from URL - support both 'categories' and 'category' parameters
    let categorySlugs: string[] = [];
    if (categoriesParam) {
      categorySlugs = categoriesParam.split(',');
    } else if (categoryParam) {
      categorySlugs = [categoryParam];
    }
    
    if (categorySlugs.length > 0 && categories.length > 0) {
      const categoryIds = categorySlugs
        .map(slug => categories.find(cat => cat.slug === slug)?.id)
        .filter(Boolean);
      setSelectedCategories(categoryIds);
    }
    
    // Handle brands from URL
    if (brandsParam && brands.length > 0) {
      const brandNames = brandsParam.split(',');
      const brandIds = brandNames
        .map(name => brands.find(brand => brand.name === name)?.id)
        .filter(Boolean);
      setSelectedBrands(brandIds);
    }
  }, [searchParams, categories, brands]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    // Categories - use slugs for better URLs
    if (selectedCategories.length > 0) {
      const categorySlugs = selectedCategories
        .map(id => categories.find(cat => cat.id === id)?.slug)
        .filter(Boolean);
      if (categorySlugs.length > 0) {
        newSearchParams.set('categories', categorySlugs.join(','));
      }
    }
    
    // Brands - use brand names for better URLs
    if (selectedBrands.length > 0) {
      const brandNames = selectedBrands
        .map(id => brands.find(brand => brand.id === id)?.name)
        .filter(Boolean);
      if (brandNames.length > 0) {
        newSearchParams.set('brands', brandNames.join(','));
      }
    }
    
    // Search query
    if (debouncedSearchQuery) {
      newSearchParams.set('search', debouncedSearchQuery);
    }
    
    // Price range
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      newSearchParams.set('minPrice', priceRange[0].toString());
      newSearchParams.set('maxPrice', priceRange[1].toString());
    }
    
    // Rating filter
    if (ratingFilter) {
      newSearchParams.set('rating', ratingFilter.toString());
    }
    
    // Stock filter
    if (stockFilter !== 'all') {
      newSearchParams.set('stock', stockFilter);
    }
    
    // Featured filter
    if (featuredFilter) {
      newSearchParams.set('featured', 'true');
    }
    
    // Sort by
    if (sortBy !== 'popular') {
      newSearchParams.set('sort', sortBy);
    }
    
    setSearchParams(newSearchParams);
  }, [selectedCategories, selectedBrands, debouncedSearchQuery, priceRange, ratingFilter, stockFilter, featuredFilter, sortBy, categories, brands, setSearchParams]);

  const filters = {
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    search: debouncedSearchQuery || undefined,
    sortBy,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    minRating: ratingFilter || undefined,
    stockFilter: stockFilter !== 'all' ? stockFilter : undefined,
    featured: featuredFilter || undefined,
  };

  const { data: accessories = [], isLoading: accessoriesLoading } = useAccessories(filters);


  const wishlistAccessoryIds = wishlistItems.map(item => item.accessory_id);

  const toggleFavorite = (accessoryId: string) => {
    if (!user || !user.id) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    if (!accessoryId) {
      toast.error('Invalid accessory');
      return;
    }

    if (wishlistAccessoryIds.includes(accessoryId)) {
      removeFromWishlistMutation.mutate({ 
        userId: user.id, 
        accessoryId 
      });
    } else {
      addToWishlistMutation.mutate({ 
        userId: user.id, 
        accessoryId 
      });
    }
  };

  const handleAddToCart = (accessoryId: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    addToCartMutation.mutate({
      userId: user.id,
      accessoryId
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setSortBy('popular');
    setPriceRange([0, 1000]);
    setRatingFilter(null);
    setStockFilter('all');
    setFeaturedFilter(false);
    // Clear URL parameters
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    selectedBrands.length > 0 || 
    searchQuery || 
    priceRange[0] > 0 || 
    priceRange[1] < 1000 || 
    ratingFilter !== null || 
    stockFilter !== 'all' || 
    featuredFilter;

  const AccessoryCard = ({ accessory, isHighlighted = false }: { accessory: any, isHighlighted?: boolean }) => {
    const isInWishlist = wishlistAccessoryIds.includes(accessory.id);
    const hasDiscount = accessory.original_price && accessory.original_price > accessory.price;
    const discountPercent = hasDiscount 
      ? Math.round((1 - accessory.price / accessory.original_price) * 100)
      : 0;

    const handleCardClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return (
      <Card 
        className={`group hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer ${
        isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {isHighlighted && (
            <Badge className="bg-green-500 hover:bg-green-600">Featured</Badge>
          )}
          {accessory.is_featured && (
            <Badge className="bg-blue-500 hover:bg-blue-600">Popular</Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-red-500 hover:bg-red-600">-{discountPercent}%</Badge>
          )}
          {accessory.stock_quantity <= 0 && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          disabled={!user || !accessory.id || accessoriesLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (user && accessory.id) {
              toggleFavorite(accessory.id);
            }
          }}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white shadow-sm"
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} 
          />
        </Button>

        {/* Product Image */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {accessory.image_url ? (
            <img 
              src={accessory.image_url}
              alt={accessory.name}
              className="w-full h-full object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

        {/* Product Info */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {accessory.name}
            </h3>
            
                <p className="text-sm text-muted-foreground">
              {accessory.accessory_brands?.name}
                </p>

            {/* Rating */}
            <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{accessory.rating}</span>
              <span className="text-xs text-muted-foreground">({accessory.review_count})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{formatPriceToEuro(accessory.price)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPriceToEuro(accessory.original_price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-xs">
              {accessory.stock_quantity > 0 ? (
                <span className="text-green-600">In Stock ({accessory.stock_quantity} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(accessory.id);
                }}
                disabled={accessory.stock_quantity <= 0}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-2 text-left font-medium text-gray-900 hover:text-gray-700"
        >
          {title}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="mt-2 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const FilterSidebar = ({ className = "" }: { className?: string }) => (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
            {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
              id="search"
                placeholder="Search accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
        </div>

        <Separator />

        {/* Categories */}
        <FilterSection title="Categories">
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon] || Smartphone;
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <IconComponent className="h-4 w-4" />
                      {category.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </FilterSection>

        {/* Brands */}
        <FilterSection title="Brands">
          {brandsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => handleBrandToggle(brand.id)}
                  />
                  <Label 
                    htmlFor={`brand-${brand.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Price Range */}
        <FilterSection title={t('accessories.priceRange')}>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-20"
                min={0}
                max={priceRange[1]}
              />
              <span className="text-sm text-gray-500">to</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-20"
                min={priceRange[0]}
                max={1000}
              />
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={ratingFilter === rating}
                  onCheckedChange={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                />
                <Label 
                  htmlFor={`rating-${rating}`}
                  className="flex items-center gap-1 text-sm cursor-pointer"
                >
                  <span>{rating}+</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Stock Status */}
        <FilterSection title="Stock Status">
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Items' },
              { value: 'in-stock', label: 'In Stock' },
              { value: 'out-of-stock', label: 'Out of Stock' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`stock-${option.value}`}
                  checked={stockFilter === option.value}
                  onCheckedChange={() => setStockFilter(option.value as any)}
                />
                <Label 
                  htmlFor={`stock-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Featured */}
        <FilterSection title="Featured">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featuredFilter}
              onCheckedChange={(checked) => setFeaturedFilter(checked as boolean)}
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              {t('accessories.featuredOnly')}
            </Label>
          </div>
        </FilterSection>

        {/* Sort */}
        <FilterSection title={t('accessories.sortBy')}>
              <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('accessories.mostPopular')}</SelectItem>
                  <SelectItem value="price-low">{t('accessories.priceLowToHigh')}</SelectItem>
                  <SelectItem value="price-high">{t('accessories.priceHighToLow')}</SelectItem>
                  <SelectItem value="rating">{t('accessories.highestRated')}</SelectItem>
              <SelectItem value="newest">{t('accessories.newestFirst')}</SelectItem>
                </SelectContent>
              </Select>
        </FilterSection>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
    

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <div className="sticky top-8">
              <FilterSidebar />
            </div>
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
            <SheetContent side="left" className="w-[320px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t('accessories.filters')}
                </SheetTitle>
                <SheetDescription>
                  {t('accessories.filterDescription')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
        </div>
              {/* Mobile Close Button */}
              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={() => setIsFilterSidebarOpen(false)} 
                  className="w-full"
                >
{t('accessories.applyFilters')}
                </Button>
          </div>
            </SheetContent>
          </Sheet>

      {/* Products Grid */}
          <div className="flex-1">
                        {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {debouncedSearchQuery ? t('accessories.searchResults', { query: debouncedSearchQuery }) : t('accessories.allProducts')}
            </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
              {t('accessories.productsFound', { count: accessories.length })}
                  {hasActiveFilters && (
                    <span className="ml-2 text-sm">
                      ({t('accessories.filtered')})
            </span>
                  )}
                </p>
          </div>

              {/* Mobile Filter Toggle */}
              <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('accessories.filters')}
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                        {selectedCategories.length + selectedBrands.length + (debouncedSearchQuery ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0) + (ratingFilter ? 1 : 0) + (stockFilter !== 'all' ? 1 : 0) + (featuredFilter ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="gap-1">
                      {category.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleCategoryToggle(categoryId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {selectedBrands.map(brandId => {
                  const brand = brands.find(b => b.id === brandId);
                  return brand ? (
                    <Badge key={brandId} variant="secondary" className="gap-1">
                      {brand.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleBrandToggle(brandId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {priceRange[0] > 0 || priceRange[1] < 1000 ? (
                  <Badge variant="secondary" className="gap-1">
                    {formatPriceToEuro(priceRange[0])} - {formatPriceToEuro(priceRange[1])}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setPriceRange([0, 1000])}
                    />
                  </Badge>
                ) : null}
                {ratingFilter && (
                  <Badge variant="secondary" className="gap-1">
                    {ratingFilter}+ Stars
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setRatingFilter(null)}
                    />
                  </Badge>
                )}
                {stockFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {stockFilter === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setStockFilter('all')}
                    />
                  </Badge>
                )}
                {featuredFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Featured Only
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFeaturedFilter(false)}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Mobile Sort Section */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t('accessories.sortBy')}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">{t('accessories.mostPopular')}</SelectItem>
                    <SelectItem value="price-low">{t('accessories.priceLowToHigh')}</SelectItem>
                    <SelectItem value="price-high">{t('accessories.priceHighToLow')}</SelectItem>
                    <SelectItem value="rating">{t('accessories.highestRated')}</SelectItem>
                    <SelectItem value="newest">{t('accessories.newestFirst')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Products */}
          {accessoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 mb-4" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : accessories.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
            </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {accessories.map((accessory) => (
                  <Link key={accessory.id} to={`/accessories/${accessory.accessory_categories?.slug || generateSlug(accessory.accessory_categories?.name || 'uncategorized')}/${accessory.slug || generateSlug(accessory.name)}`}>
                <AccessoryCard 
                  accessory={accessory} 
                  isHighlighted={highlightedAccessory === accessory.id}
                />
                  </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Accessories?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We carefully curate every product to ensure quality, compatibility, and value for your devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Quality Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All products undergo rigorous testing and come with manufacturer warranties.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                <CardTitle>Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get your accessories quickly with our same-day and next-day delivery options.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <Star className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our team helps you find the perfect accessories for your specific device.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

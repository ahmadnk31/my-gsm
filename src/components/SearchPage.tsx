import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, SortAsc, SortDesc, Grid, List, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Search } from './Search';

// Helper function to get the full image URL
const getImageUrl = (imageUrl: string | null, bucket = 'accessories') => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, construct the full Supabase storage URL
  if (imageUrl.startsWith('/')) {
    // Remove leading slash if present
    imageUrl = imageUrl.substring(1);
  }
  
  // Get the Supabase storage URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(imageUrl);
  return data.publicUrl;
};

interface SearchResult {
  id: string;
  type: 'device' | 'part' | 'accessory';
  title: string;
  subtitle: string;
  description?: string;
  price?: number;
  image?: string;
  url: string;
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
}

type SortOption = 'relevance' | 'name' | 'price-low' | 'price-high' | 'rating';
type ViewMode = 'grid' | 'list';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Perform search when query changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [query]);

  // Filter and sort results when filters change
  useEffect(() => {
    let filtered = [...results];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(result => {
      if (!result.price) return true;
      return result.price >= priceRange[0] && result.price <= priceRange[1];
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0; // relevance - keep original order
      }
    });

    setFilteredResults(filtered);
  }, [results, selectedType, selectedCategory, sortBy, priceRange]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const searchTerm = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      // Search device categories with broader matching
      const { data: categories } = await supabase
        .from('device_categories')
        .select('id, name, description, icon_name')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      categories?.forEach(category => {
        results.push({
          id: category.id,
          type: 'device',
          title: category.name,
          subtitle: 'Device Category',
          description: category.description,
          url: `/repairs?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`,
          category: category.name
        });
      });

      // Search device brands with broader matching
      const { data: brands } = await supabase
        .from('device_brands')
        .select(`
          id, 
          name, 
          description,
          logo_url,
          device_categories!inner(name)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      brands?.forEach(brand => {
        const imageUrl = getImageUrl(brand.logo_url, 'devices');
        results.push({
          id: brand.id,
          type: 'device',
          title: brand.name,
          subtitle: `${brand.device_categories.name} Brand`,
          description: brand.description,
          image: imageUrl,
          url: `/repairs?category=${brand.device_categories.name.toLowerCase().replace(/\s+/g, '-')}&brand=${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
          brand: brand.name,
          category: brand.device_categories.name
        });
      });

      // Search device models with broader matching
      const { data: models } = await supabase
        .from('device_models')
        .select(`
          id, 
          name, 
          description,
          image_url,
          device_brands!inner(name, device_categories!inner(name))
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      models?.forEach(model => {
        const imageUrl = getImageUrl(model.image_url, 'devices');
        results.push({
          id: model.id,
          type: 'device',
          title: model.name,
          subtitle: `${model.device_brands.name} ${model.device_brands.device_categories.name}`,
          description: model.description,
          image: imageUrl,
          url: `/repairs?category=${model.device_brands.device_categories.name.toLowerCase().replace(/\s+/g, '-')}&brand=${model.device_brands.name.toLowerCase().replace(/\s+/g, '-')}&model=${model.name.toLowerCase().replace(/\s+/g, '')}`,
          brand: model.device_brands.name,
          category: model.device_brands.device_categories.name
        });
      });

      // Search device parts with broader matching
      const { data: parts } = await supabase
        .from('device_parts')
        .select(`
          id, 
          name, 
          description,
          category,
          image_url,
          device_models!inner(name, device_brands!inner(name, device_categories!inner(name)))
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      parts?.forEach(part => {
        const imageUrl = getImageUrl(part.image_url, 'devices');
        results.push({
          id: part.id,
          type: 'part',
          title: part.name,
          subtitle: `${part.device_models.device_brands.name} ${part.device_models.name} - ${part.category}`,
          description: part.description,
          image: imageUrl,
          url: `/repairs?category=${part.device_models.device_brands.device_categories.name.toLowerCase().replace(/\s+/g, '-')}&brand=${part.device_models.device_brands.name.toLowerCase().replace(/\s+/g, '-')}&model=${part.device_models.name.toLowerCase().replace(/\s+/g, '')}`,
          category: part.category,
          brand: part.device_models.device_brands.name
        });
      });

      // Search accessories with broader matching
      const { data: accessories } = await supabase
        .from('accessories')
        .select(`
          id, 
          name, 
          description,
          price,
          image_url,
          rating,
          review_count,
          tags,
          slug,
          accessory_categories!inner(name, slug),
          accessory_brands!inner(name)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags::text.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      accessories?.forEach(accessory => {
        const imageUrl = getImageUrl(accessory.image_url);
        results.push({
          id: accessory.id,
          type: 'accessory',
          title: accessory.name,
          subtitle: `${accessory.accessory_brands.name} ${accessory.accessory_categories.name}`,
          description: accessory.description,
          price: accessory.price,
          image: imageUrl,
          rating: accessory.rating,
          reviewCount: accessory.review_count,
          url: `/accessories/product?category=${accessory.accessory_categories.slug || 'uncategorized'}&product=${accessory.slug || accessory.id}`,
          category: accessory.accessory_categories.name,
          brand: accessory.accessory_brands.name
        });
      });

      // Also search for accessories by category name (e.g., "charger" matches "chargers" category)
      const { data: categoryAccessories } = await supabase
        .from('accessories')
        .select(`
          id, 
          name, 
          description,
          price,
          image_url,
          rating,
          review_count,
          tags,
          slug,
          accessory_categories!inner(name, slug),
          accessory_brands!inner(name)
        `)
        .eq('is_active', true)
        .ilike('accessory_categories.name', `%${searchTerm}%`);

      categoryAccessories?.forEach(accessory => {
        // Only add if not already in results
        if (!results.find(r => r.id === accessory.id && r.type === 'accessory')) {
          const imageUrl = getImageUrl(accessory.image_url);
          results.push({
            id: accessory.id,
            type: 'accessory',
            title: accessory.name,
            subtitle: `${accessory.accessory_brands.name} ${accessory.accessory_categories.name}`,
            description: accessory.description,
            price: accessory.price,
            image: imageUrl,
            rating: accessory.rating,
            reviewCount: accessory.review_count,
            url: `/accessories/product?category=${accessory.accessory_categories.slug || 'uncategorized'}&product=${accessory.slug || accessory.id}`,
            category: accessory.accessory_categories.name,
            brand: accessory.accessory_brands.name
          });
        }
      });

      // Also search for partial matches in brand names for better results
      const { data: brandMatches } = await supabase
        .from('device_brands')
        .select(`
          id, 
          name, 
          description,
          device_categories!inner(name)
        `)
        .ilike('name', `%${searchTerm}%`)
        .eq('is_active', true);

      brandMatches?.forEach(brand => {
        // Only add if not already in results
        if (!results.find(r => r.id === brand.id && r.type === 'device')) {
          results.push({
            id: brand.id,
            type: 'device',
            title: brand.name,
            subtitle: `${brand.device_categories.name} Brand`,
            description: brand.description,
            url: `/repairs?category=${brand.device_categories.name.toLowerCase().replace(/\s+/g, '-')}&brand=${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
            brand: brand.name,
            category: brand.device_categories.name
          });
        }
      });

      // Remove duplicates
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id && r.type === result.type)
      );

      setResults(uniqueResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSortBy('relevance');
    setPriceRange([0, 1000]);
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    switch (type) {
      case 'device':
        return <Badge variant="secondary">Device</Badge>;
      case 'part':
        return <Badge variant="outline">Part</Badge>;
      case 'accessory':
        return <Badge variant="default">Accessory</Badge>;
      default:
        return null;
    }
  };

  const getUniqueCategories = () => {
    const categories = results.map(result => result.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const renderResultCard = (result: SearchResult) => (
    <Card 
      key={`${result.type}-${result.id}`}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={() => handleResultClick(result)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {result.image ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
              <img 
                src={result.image} 
                alt={result.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const container = target.parentElement;
                  if (container) {
                    target.style.display = 'none';
                    const fallback = container.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }
                }}
              />
              <div className="fallback-icon absolute inset-0 hidden items-center justify-center bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{result.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{result.subtitle}</p>
              </div>
              {getTypeBadge(result.type)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {result.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {result.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.rating && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{result.rating}</span>
                <span className="text-yellow-500">★</span>
                {result.reviewCount && (
                  <span className="text-xs text-muted-foreground">({result.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          
          {result.price && (
            <span className="text-lg font-bold text-primary">
              ${result.price}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderResultList = (result: SearchResult) => (
    <Card 
      key={`${result.type}-${result.id}`}
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => handleResultClick(result)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {result.image ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
              <img 
                src={result.image} 
                alt={result.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const container = target.parentElement;
                  if (container) {
                    target.style.display = 'none';
                    const fallback = container.querySelector('.fallback-icon') as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }
                }}
              />
              <div className="fallback-icon absolute inset-0 hidden items-center justify-center bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{result.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{result.subtitle}</p>
                {result.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {result.description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2 ml-4">
                {getTypeBadge(result.type)}
                {result.price && (
                  <span className="text-lg font-bold text-primary">
                    ${result.price}
                  </span>
                )}
              </div>
            </div>
            
            {result.rating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{result.rating}</span>
                  <span className="text-yellow-500">★</span>
                  {result.reviewCount && (
                    <span className="text-xs text-muted-foreground">({result.reviewCount} reviews)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground mb-6">
            Enter a search term to find devices, parts, and accessories
          </p>
          <div className="max-w-md mx-auto">
            <Search />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 max-w-md">
            <Search />
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Search Results</h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `${filteredResults.length} results for "${query}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="device">Devices</SelectItem>
                    <SelectItem value="part">Parts</SelectItem>
                    <SelectItem value="accessory">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              {getUniqueCategories().length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                No results found for "{query}". Try adjusting your search terms or filters.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredResults.map(result => 
                viewMode === 'grid' ? renderResultCard(result) : renderResultList(result)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, Package, Smartphone, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useSearch } from '@/hooks/useSearch';
import { useLanguage } from '@/contexts/LanguageContext';

// Helper function to get the full image URL
const getImageUrl = (imageUrl: string | null, bucketName: string = 'accessories') => {
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
  
  // Get the Supabase storage URL from the appropriate bucket
  const { data } = supabase.storage.from(bucketName).getPublicUrl(imageUrl);
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

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular';
}

interface SearchProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Search({ isOpen: externalIsOpen, onClose }: SearchProps = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch } = useSearch();
  const { t } = useLanguage();

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalIsOpen !== undefined ? onClose || (() => {}) : setInternalIsOpen;

  // Save recent search using the hook
  const saveRecentSearch = (searchTerm: string) => {
    addRecentSearch(searchTerm);
  };

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchTerm = searchQuery.toLowerCase();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      const results: SearchResult[] = [];

      // Search device categories with broader matching
      const { data: categories } = await supabase
        .from('device_categories')
        .select('id, name, description, icon_name')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .limit(5);

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
        .eq('is_active', true)
        .limit(5);

      brands?.forEach(brand => {
        const imageUrl = getImageUrl(brand.logo_url, 'brands');
        results.push({
          id: brand.id,
          type: 'device',
          title: brand.name,
          subtitle: `${brand.device_categories.name} Brand`,
          description: brand.description,
          image: imageUrl,
          url: `/repairs?category=${brand.device_categories.name.toLowerCase().replace(/\s+/g, '')}`,
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
        .eq('is_active', true)
        .limit(5);

      models?.forEach(model => {
        const imageUrl = getImageUrl(model.image_url, 'devices');
        results.push({
          id: model.id,
          type: 'device',
          title: model.name,
          subtitle: `${model.device_brands.name} ${model.device_brands.device_categories.name}`,
          description: model.description,
          image: imageUrl,
          url: `/repairs?category=${model.device_brands.device_categories.name.toLowerCase().replace(/\s+/g, '')}&brand=${model.device_brands.name.toLowerCase().replace(/\s+/g, '')}&model=${model.name.toLowerCase().replace(/\s+/g, '')}`,
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
        .eq('is_active', true)
        .limit(5);

      parts?.forEach(part => {
        const imageUrl = getImageUrl(part.image_url, 'devices');
        results.push({
          id: part.id,
          type: 'part',
          title: part.name,
          subtitle: `${part.device_models.device_brands.name} ${part.device_models.name} - ${part.category}`,
          description: part.description,
          image: imageUrl,
          url: `/repairs?category=${part.device_models.device_brands.device_categories.name.toLowerCase().replace(/\s+/g, '')}&brand=${part.device_models.device_brands.name.toLowerCase().replace(/\s+/g, '')}&model=${part.device_models.name.toLowerCase().replace(/\s+/g, '')}`,
          category: part.category,
          brand: part.device_models.device_brands.name
        });
      });

      // Search accessories with broader matching
      let accessoriesQuery = supabase
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
        .eq('is_active', true);

      // Build a comprehensive search query
      const searchConditions = [
        `name.ilike.%${searchTerm}%`,
        `description.ilike.%${searchTerm}%`,
        `tags::text.ilike.%${searchTerm}%`
      ];

      // Add individual word searches for better matching
      searchWords.forEach(word => {
        if (word.length > 2) { // Only search for words longer than 2 characters
          searchConditions.push(`name.ilike.%${word}%`);
          searchConditions.push(`description.ilike.%${word}%`);
          searchConditions.push(`tags::text.ilike.%${word}%`);
        }
      });

      const { data: accessories } = await accessoriesQuery
        .or(searchConditions.join(','))
        .limit(5);

      console.log('Search term:', searchTerm);
      console.log('Search conditions:', searchConditions);
      console.log('Found accessories:', accessories);

      accessories?.forEach(accessory => {
        console.log('Accessory image_url:', accessory.image_url, 'for', accessory.name);
        const imageUrl = getImageUrl(accessory.image_url);
        console.log('Processed image URL:', imageUrl, 'for', accessory.name);
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
        .ilike('accessory_categories.name', `%${searchTerm}%`)
        .limit(3);

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
        .eq('is_active', true)
        .limit(3);

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

      // Remove duplicates and limit to 15 results
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id && r.type === result.type)
      ).slice(0, 15);

      setResults(uniqueResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
      setHasSearched(false);
      // Don't close modal when query is empty
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Generate suggestions
  useEffect(() => {
    if (!query.trim()) {
      const popularSearches: SearchSuggestion[] = [
        { text: 'iPhone screen repair', type: 'popular' },
        { text: 'Samsung battery replacement', type: 'popular' },
        { text: 'Phone cases', type: 'popular' },
        { text: 'Charging cables', type: 'popular' },
        { text: 'Screen protectors', type: 'popular' }
      ];

      const recentSearchesList: SearchSuggestion[] = recentSearches.map(search => ({
        text: search,
        type: 'recent'
      }));

      setSuggestions([...recentSearchesList, ...popularSearches]);
    } else {
      setSuggestions([]);
    }
  }, [query, recentSearches]);

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    closeSearch();
    setQuery('');
    navigate(result.url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      closeSearch();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    saveRecentSearch(suggestion.text);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    // Don't close the modal when clearing search
  };

  const clearAllAndClose = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsOpen(false);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setHasSearched(false);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'device':
        return <Smartphone className="h-4 w-4" />;
      case 'part':
        return <Package className="h-4 w-4" />;
      case 'accessory':
        return <Package className="h-4 w-4" />;
      default:
        return <SearchIcon className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: SearchResult['type']) => {
    switch (type) {
      case 'device':
        return <Badge variant="secondary" className="text-xs">Device</Badge>;
      case 'part':
        return <Badge variant="outline" className="text-xs">Part</Badge>;
      case 'accessory':
        return <Badge variant="default" className="text-xs">Accessory</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Only show the input field when not used as a modal */}
      {externalIsOpen === undefined && (
        <div className="relative w-full max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search devices, parts, accessories..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => {
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !query.trim()) {
                  e.preventDefault();
                }
              }}
              className="pl-10 pr-10 cursor-pointer"
              readOnly
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 z-10"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </form>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    placeholder={t('search.placeholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-lg"
                    autoFocus
                  />
                </form>
              </div>
              {query && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-8 px-3 text-sm"
                  >
                    {t('search.clear')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllAndClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Command className="h-full">
                <CommandList className="max-h-full">
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      <span className="text-muted-foreground">Searching...</span>
                    </div>
                  )}

                  {!isLoading && query && results.length === 0 && (
                    <CommandEmpty>
                      <div className="text-center py-12">
                        <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No results found</h3>
                        <p className="text-muted-foreground mb-4">
                          No results found for "{query}". Try different keywords or browse categories.
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Try searching for:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {['iPhone', 'Samsung', 'charger', 'screen', 'battery'].map((term) => (
                              <Button
                                key={term}
                                variant="outline"
                                size="sm"
                                onClick={() => setQuery(term)}
                              >
                                {term}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CommandEmpty>
                  )}

                  {!isLoading && !query && suggestions.length > 0 && (
                    <>
                      <CommandGroup heading="Recent Searches">
                        {suggestions.filter(s => s.type === 'recent').map((suggestion, index) => (
                          <CommandItem
                            key={`recent-${index}`}
                            onSelect={() => handleSuggestionClick(suggestion)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{suggestion.text}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      <CommandGroup heading="Popular Searches">
                        {suggestions.filter(s => s.type === 'popular').map((suggestion, index) => (
                          <CommandItem
                            key={`popular-${index}`}
                            onSelect={() => handleSuggestionClick(suggestion)}
                            className="flex items-center gap-3 p-3"
                          >
                            <SearchIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{suggestion.text}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}

                  {!isLoading && results.length > 0 && (
                    <CommandGroup heading={`Search Results (${results.length})`}>
                      {results.map((result) => (
                        <CommandItem
                          key={`${result.type}-${result.id}`}
                          onSelect={() => handleResultClick(result)}
                          className="flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {result.image ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
                                <img 
                                  src={result.image} 
                                  alt={result.title}
                                  className="w-full h-full object-cover"
                                  onLoad={(e) => {
                                    // Image loaded successfully, ensure it's visible
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'block';
                                  }}
                                  onError={(e) => {
                                    console.log('Image failed to load:', result.image, 'for', result.title);
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
                                <div className="fallback-icon absolute inset-0 hidden items-center justify-center">
                                  {getResultIcon(result.type)}
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                {getResultIcon(result.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-base truncate">{result.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                                {result.description && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {result.description}
                                  </p>
                                )}
                                {result.rating && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium">{result.rating}</span>
                                      <span className="text-yellow-500">★</span>
                                      {result.reviewCount && (
                                        <span className="text-sm text-muted-foreground">({result.reviewCount} reviews)</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getTypeBadge(result.type)}
                                {result.price && (
                                  <span className="text-lg font-bold text-primary">
                                    ${result.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

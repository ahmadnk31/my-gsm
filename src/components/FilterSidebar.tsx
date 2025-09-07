import { useState, useCallback, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  Search, 
  Star, 
  ChevronDown,
  ChevronUp,
  Smartphone
} from "lucide-react";

import { 
  Shield, 
  Zap, 
  Cable, 
  Headphones, 
  Battery, 
  Laptop, 
  Watch, 
  Camera, 
  Gamepad2
} from "lucide-react";

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

interface FilterSidebarProps {
  className?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  ratingFilter: number | null;
  onRatingFilterChange: (rating: number | null) => void;
  stockFilter: 'all' | 'in-stock' | 'out-of-stock';
  onStockFilterChange: (filter: 'all' | 'in-stock' | 'out-of-stock') => void;
  featuredFilter: boolean;
  onFeaturedFilterChange: (featured: boolean) => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
  categories: any[];
  brands: any[];
  categoriesLoading: boolean;
  brandsLoading: boolean;
}

const FilterSidebar = forwardRef<HTMLInputElement, FilterSidebarProps>(({
  className = "",
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  selectedBrands,
  onBrandsChange,
  priceRange,
  onPriceRangeChange,
  ratingFilter,
  onRatingFilterChange,
  stockFilter,
  onStockFilterChange,
  featuredFilter,
  onFeaturedFilterChange,
  hasActiveFilters,
  onClearAllFilters,
  categories,
  brands,
  categoriesLoading,
  brandsLoading
}, ref) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
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
              onClick={onClearAllFilters}
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
              ref={ref}
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <FilterSection title="Categories">
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon ? iconMap[category.icon] : Smartphone;
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onCategoriesChange([...selectedCategories, category.id]);
                        } else {
                          onCategoriesChange(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2 cursor-pointer">
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
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
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onBrandsChange([...selectedBrands, brand.id]);
                      } else {
                        onBrandsChange(selectedBrands.filter(id => id !== brand.id));
                      }
                    }}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>€{priceRange[0]}</span>
              <span>€{priceRange[1]}</span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={onPriceRangeChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection title="Rating">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={ratingFilter === rating}
                  onCheckedChange={(checked) => {
                    onRatingFilterChange(checked ? rating : null);
                  }}
                />
                <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-1 text-sm">& up</span>
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Stock Filter */}
        <FilterSection title="Availability">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={stockFilter === 'in-stock'}
                onCheckedChange={(checked) => {
                  onStockFilterChange(checked ? 'in-stock' : 'all');
                }}
              />
              <Label htmlFor="in-stock" className="cursor-pointer">In Stock</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="out-of-stock"
                checked={stockFilter === 'out-of-stock'}
                onCheckedChange={(checked) => {
                  onStockFilterChange(checked ? 'out-of-stock' : 'all');
                }}
              />
              <Label htmlFor="out-of-stock" className="cursor-pointer">Out of Stock</Label>
            </div>
          </div>
        </FilterSection>

        {/* Featured Filter */}
        <FilterSection title="Special">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featuredFilter}
              onCheckedChange={onFeaturedFilterChange}
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured Products</Label>
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  );
});

FilterSidebar.displayName = "FilterSidebar";

export default FilterSidebar;

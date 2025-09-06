import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Star, Package, Loader2, Search, Filter } from "lucide-react";
import { useAccessories, useAccessoryCategories, useAccessoryBrands } from '@/hooks/useAccessories';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageDropzone } from '@/components/ui/ImageDropzone';

interface AccessoryFormData {
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  price: number;
  original_price: number | null;
  sku: string;
  image_url: string;
  features: string[];
  compatibility: string[];
  stock_quantity: number;
  min_stock_level: number;
  is_featured: boolean;
  is_active: boolean;
  warranty_months: number | null;
  weight_grams: number | null;
}

export function AccessoriesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [formData, setFormData] = useState<AccessoryFormData>({
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    price: 0,
    original_price: null,
    sku: '',
    image_url: '',
    features: [],
    compatibility: [],
    stock_quantity: 0,
    min_stock_level: 5,
    is_featured: false,
    is_active: true,
    warranty_months: null,
    weight_grams: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');
  const [compatibilityInput, setCompatibilityInput] = useState('');

  const filters = {
    search: searchTerm || undefined,
    category: categoryFilter || undefined,
    brand: brandFilter || undefined
  };

  const { data: accessories = [], isLoading } = useAccessories(filters);
  const { data: categories = [] } = useAccessoryCategories();
  const { data: brands = [] } = useAccessoryBrands();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: AccessoryFormData) => {
      const { data: result, error } = await supabase
        .from('accessories')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Accessory created successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create accessory');
      console.error('Error creating accessory:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccessoryFormData> }) => {
      const { data: result, error } = await supabase
        .from('accessories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Accessory updated successfully');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update accessory');
      console.error('Error updating accessory:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accessories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Accessory deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete accessory');
      console.error('Error deleting accessory:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      brand_id: '',
      price: 0,
      original_price: null,
      sku: '',
      image_url: '',
      features: [],
      compatibility: [],
      stock_quantity: 0,
      min_stock_level: 5,
      is_featured: false,
      is_active: true,
      warranty_months: null,
      weight_grams: null
    });
    setFeaturesInput('');
    setCompatibilityInput('');
    setEditingAccessory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      features: featuresInput.split(',').map(f => f.trim()).filter(f => f),
      compatibility: compatibilityInput.split(',').map(c => c.trim()).filter(c => c)
    };
    
    if (editingAccessory) {
      updateMutation.mutate({ id: editingAccessory.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (accessory: any) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name,
      description: accessory.description || '',
      category_id: accessory.category_id || '',
      brand_id: accessory.brand_id || '',
      price: accessory.price,
      original_price: accessory.original_price,
      sku: accessory.sku || '',
      image_url: accessory.image_url || '',
      features: accessory.features || [],
      compatibility: accessory.compatibility || [],
      stock_quantity: accessory.stock_quantity,
      min_stock_level: accessory.min_stock_level,
      is_featured: accessory.is_featured,
      is_active: accessory.is_active,
      warranty_months: accessory.warranty_months,
      weight_grams: accessory.weight_grams
    });
    setFeaturesInput((accessory.features || []).join(', '));
    setCompatibilityInput((accessory.compatibility || []).join(', '));
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `accessories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('accessory-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('accessory-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Accessories</h2>
          <p className="text-muted-foreground">Manage accessory products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accessory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
              </DialogTitle>
              <DialogDescription>
                {editingAccessory ? 'Update accessory details' : 'Create a new accessory product'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Accessory name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Accessory description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price ($)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || null }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_stock_level">Min Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compatibility">Compatibility (comma-separated)</Label>
                <Textarea
                  id="compatibility"
                  value={compatibilityInput}
                  onChange={(e) => setCompatibilityInput(e.target.value)}
                  placeholder="iPhone 14, Samsung Galaxy S23, Google Pixel 7"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty_months">Warranty (months)</Label>
                  <Input
                    id="warranty_months"
                    type="number"
                    min="0"
                    value={formData.warranty_months || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty_months: parseInt(e.target.value) || null }))}
                    placeholder="12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_grams">Weight (grams)</Label>
                  <Input
                    id="weight_grams"
                    type="number"
                    min="0"
                    value={formData.weight_grams || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_grams: parseInt(e.target.value) || null }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Image</Label>
                <ImageDropzone
                  onFileSelect={handleImageUpload}
                  currentImageUrl={formData.image_url}
                  disabled={isUploading}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingAccessory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessories.map((accessory) => (
          <Card key={accessory.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-2">{accessory.name}</CardTitle>
                  <div className="flex gap-2">
                    {accessory.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {!accessory.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {accessory.stock_quantity <= accessory.min_stock_level && (
                      <Badge variant="outline" className="text-orange-600">Low Stock</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {accessory.image_url && (
              <div className="px-6 pb-3">
                <img 
                  src={accessory.image_url} 
                  alt={accessory.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <CardContent className="pt-0">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">${accessory.price}</span>
                  {accessory.original_price && accessory.original_price > accessory.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${accessory.original_price}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Stock: {accessory.stock_quantity}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{accessory.rating}</span>
                  </div>
                </div>

                {accessory.accessory_categories && (
                  <Badge variant="outline" className="text-xs">
                    {accessory.accessory_categories.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(accessory)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(accessory.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accessories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accessories found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first accessory product</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Accessory
          </Button>
        </div>
      )}
    </div>
  );
}

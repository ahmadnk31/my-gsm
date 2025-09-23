import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageDropzone } from '@/components/ui/ImageDropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Upload, Image, Filter, SortAsc, SortDesc, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DeviceBrand = Tables<'device_brands'>;
type DeviceModel = Tables<'device_models'>;

const modelSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  release_year: z.number().min(2000).max(2030).optional(),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true)
});

type ModelFormData = z.infer<typeof modelSchema>;

export const DeviceModelsManager: React.FC = () => {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Filtering and sorting state
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'release_year' | 'display_order' | 'brand'>('display_order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // In-place editing state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [tempOrder, setTempOrder] = useState<number>(0);

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      brand_id: '',
      name: '',
      description: '',
      image_url: '',
      release_year: new Date().getFullYear(),
      display_order: 0,
      is_active: true
    }
  });

  // Filtered and sorted models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models;

    // Apply brand filter
    if (selectedBrandFilter && selectedBrandFilter !== 'all') {
      filtered = filtered.filter(model => model.brand_id === selectedBrandFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brands.find(b => b.id === model.brand_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'brand':
          aValue = brands.find(brand => brand.id === a.brand_id)?.name?.toLowerCase() || '';
          bValue = brands.find(brand => brand.id === b.brand_id)?.name?.toLowerCase() || '';
          break;
        case 'release_year':
          aValue = a.release_year || 0;
          bValue = b.release_year || 0;
          break;
        case 'display_order':
        default:
          aValue = a.display_order || 0;
          bValue = b.display_order || 0;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [models, brands, selectedBrandFilter, searchTerm, sortBy, sortDirection]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const startEditingOrder = (model: DeviceModel) => {
    setEditingOrderId(model.id);
    setTempOrder(model.display_order || 0);
  };

  const cancelEditingOrder = () => {
    setEditingOrderId(null);
    setTempOrder(0);
  };

  const saveOrder = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('device_models')
        .update({ display_order: tempOrder })
        .eq('id', modelId);

      if (error) throw error;

      // Update local state
      setModels(models.map(model => 
        model.id === modelId 
          ? { ...model, display_order: tempOrder }
          : model
      ));

      toast.success('Display order updated');
      setEditingOrderId(null);
      setTempOrder(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch brands and models
      const [brandsResult, modelsResult] = await Promise.all([
        supabase.from('device_brands').select(`
          *,
          device_categories(name)
        `).eq('is_active', true).order('display_order'),
        supabase.from('device_models').select(`
          *,
          device_brands(name, device_categories(name))
        `).order('display_order')
      ]);

      if (brandsResult.error) throw brandsResult.error;
      if (modelsResult.error) throw modelsResult.error;

      setBrands(brandsResult.data || []);
      setModels(modelsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `models/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('model-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('model-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: ModelFormData) => {
    try {
      setUploading(true);

      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const modelData = { ...data, image_url: imageUrl };

      if (editingModel) {
        const { error } = await supabase
          .from('device_models')
          .update(modelData)
          .eq('id', editingModel.id);

        if (error) throw error;
        toast.success('Model updated successfully');
      } else {
        const { error } = await supabase
          .from('device_models')
          .insert([modelData as any]);

        if (error) throw error;
        toast.success('Model created successfully');
      }

      setDialogOpen(false);
      setEditingModel(null);
      setImageFile(null);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save model');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (model: DeviceModel) => {
    setEditingModel(model);
    form.reset({
      brand_id: model.brand_id,
      name: model.name,
      description: model.description || '',
      image_url: model.image_url || '',
      release_year: model.release_year || undefined,
      display_order: model.display_order || 0,
      is_active: model.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (model: DeviceModel) => {
    if (!confirm('Are you sure you want to delete this model? This will also delete all associated parts.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('device_models')
        .delete()
        .eq('id', model.id);

      if (error) throw error;
      toast.success('Model deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete model');
    }
  };

  const handleAddNew = () => {
    setEditingModel(null);
    setImageFile(null);
    form.reset();
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading models...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg sm:text-xl font-semibold">Device Models</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., iPhone 15 Pro, Galaxy S24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Brief description of the model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="release_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Image</FormLabel>
                  <ImageDropzone
                    onFileSelect={setImageFile}
                    currentImageUrl={form.watch('image_url')}
                    placeholder="Drop a model image here, or click to select"
                    disabled={uploading}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingModel ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search models or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Brand Filter */}
            <div className="sm:w-48">
              <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by brand" />
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
            
            {/* Sort */}
            <div className="sm:w-48">
              <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                const [newSortBy, newDirection] = value.split('-') as [typeof sortBy, 'asc' | 'desc'];
                setSortBy(newSortBy);
                setSortDirection(newDirection);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="display_order-asc">Order (Low to High)</SelectItem>
                  <SelectItem value="display_order-desc">Order (High to Low)</SelectItem>
                  <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                  <SelectItem value="brand-asc">Brand (A to Z)</SelectItem>
                  <SelectItem value="brand-desc">Brand (Z to A)</SelectItem>
                  <SelectItem value="release_year-desc">Year (Newest First)</SelectItem>
                  <SelectItem value="release_year-asc">Year (Oldest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters */}
            {(selectedBrandFilter !== 'all' || searchTerm) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedBrandFilter('all');
                  setSearchTerm('');
                }}
                className="sm:w-auto w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {filteredAndSortedModels.length} of {models.length} models
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('brand')}
                  >
                    <div className="flex items-center gap-2">
                      Brand
                      {sortBy === 'brand' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('release_year')}
                  >
                    <div className="flex items-center gap-2">
                      Year
                      {sortBy === 'release_year' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('display_order')}
                  >
                    <div className="flex items-center gap-2">
                      Order
                      {sortBy === 'display_order' && (
                        sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      {model.image_url ? (
                        <img 
                          src={model.image_url} 
                          alt={model.name} 
                          className="w-8 h-10 object-contain"
                        />
                      ) : (
                        <div className="w-8 h-10 bg-muted rounded flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      {brands.find(b => b.id === model.brand_id)?.name}
                    </TableCell>
                    <TableCell>{model.release_year}</TableCell>
                    <TableCell className="max-w-xs truncate">{model.description}</TableCell>
                    <TableCell>
                      {editingOrderId === model.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={tempOrder}
                            onChange={(e) => setTempOrder(parseInt(e.target.value) || 0)}
                            className="w-16 h-8"
                            min="0"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveOrder(model.id)}
                            className="h-8 w-8 p-0 text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingOrder}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => startEditingOrder(model)}
                          className="h-8 px-2 hover:bg-muted"
                        >
                          {model.display_order}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={model.is_active ? 'default' : 'secondary'}>
                        {model.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(model)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(model)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 p-4">
            {filteredAndSortedModels.map((model) => (
              <Card key={model.id} className="p-4">
                <div className="flex items-start gap-3">
                  {model.image_url ? (
                    <img 
                      src={model.image_url} 
                      alt={model.name} 
                      className="w-12 h-15 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-15 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{model.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {brands.find(b => b.id === model.brand_id)?.name}
                          {model.release_year && ` • ${model.release_year}`}
                        </p>
                        {model.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {model.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={model.is_active ? 'default' : 'secondary'} className="text-xs">
                            {model.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Order:</span>
                            {editingOrderId === model.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={tempOrder}
                                  onChange={(e) => setTempOrder(parseInt(e.target.value) || 0)}
                                  className="w-14 h-6 text-xs"
                                  min="0"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveOrder(model.id)}
                                  className="h-6 w-6 p-0 text-green-600"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditingOrder}
                                  className="h-6 w-6 p-0 text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                onClick={() => startEditingOrder(model)}
                                className="h-6 px-2 text-xs hover:bg-muted"
                              >
                                {model.display_order}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(model)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(model)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

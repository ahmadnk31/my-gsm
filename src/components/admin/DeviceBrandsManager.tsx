import React, { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DeviceCategory = Tables<'device_categories'>;
type DeviceBrand = Tables<'device_brands'>;

const brandSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true)
});

type BrandFormData = z.infer<typeof brandSchema>;

export const DeviceBrandsManager: React.FC = () => {
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<DeviceBrand | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      category_id: '',
      name: '',
      description: '',
      logo_url: '',
      display_order: 0,
      is_active: true
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and brands
      const [categoriesResult, brandsResult] = await Promise.all([
        supabase.from('device_categories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('device_brands').select(`
          *,
          device_categories(name)
        `).order('display_order')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (brandsResult.error) throw brandsResult.error;

      setCategories(categoriesResult.data || []);
      setBrands(brandsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brand-logos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: BrandFormData) => {
    try {
      setUploading(true);

      let logoUrl = data.logo_url;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const brandData = { ...data, logo_url: logoUrl };

      if (editingBrand) {
        const { error } = await supabase
          .from('device_brands')
          .update(brandData)
          .eq('id', editingBrand.id);

        if (error) throw error;
        toast.success('Brand updated successfully');
      } else {
        const { error } = await supabase
          .from('device_brands')
          .insert([brandData as any]);

        if (error) throw error;
        toast.success('Brand created successfully');
      }

      setDialogOpen(false);
      setEditingBrand(null);
      setLogoFile(null);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save brand');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (brand: DeviceBrand) => {
    setEditingBrand(brand);
    form.reset({
      category_id: brand.category_id,
      name: brand.name,
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      display_order: brand.display_order || 0,
      is_active: brand.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (brand: DeviceBrand) => {
    if (!confirm('Are you sure you want to delete this brand? This will also delete all associated models and parts.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('device_brands')
        .delete()
        .eq('id', brand.id);

      if (error) throw error;
      toast.success('Brand deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete brand');
    }
  };

  const handleAddNew = () => {
    setEditingBrand(null);
    setLogoFile(null);
    form.reset();
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Loading brands...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Device Brands</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                        <Input {...field} placeholder="e.g., Apple, Samsung" />
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
                        <Textarea {...field} placeholder="Brief description of the brand" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Logo</FormLabel>
                  <ImageDropzone
                    onFileSelect={setLogoFile}
                    currentImageUrl={form.watch('logo_url')}
                    placeholder="Drop a brand logo here, or click to select"
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
                    {uploading ? 'Uploading...' : editingBrand ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name} 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === brand.category_id)?.name}
                  </TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell>{brand.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(brand)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(brand)}
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
        </CardContent>
      </Card>
    </div>
  );
};

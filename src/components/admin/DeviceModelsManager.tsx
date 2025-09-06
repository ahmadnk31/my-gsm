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
    return <div>Loading models...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Device Models</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
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
                  <TableCell>{model.display_order}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

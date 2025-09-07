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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageDropzone } from '@/components/ui/ImageDropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Upload, Image, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DeviceModel = Tables<'device_models'>;
type DevicePart = Tables<'device_parts'>;
type PartPricing = Tables<'part_pricing'>;

const partSchema = z.object({
  model_id: z.string().min(1, 'Model is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().optional(),
  estimated_duration: z.string().optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).default('medium'),
  warranty_period: z.string().default('1 year'),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true)
});

const pricingSchema = z.object({
  part_id: z.string().min(1, 'Part is required'),
  quality_type: z.enum(['original', 'oem', 'aftermarket', 'refurbished']),
  quality_description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  labor_cost: z.number().min(0).default(0),
  supplier: z.string().optional(),
  availability_status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
  is_active: z.boolean().default(true)
});

type PartFormData = z.infer<typeof partSchema>;
type PricingFormData = z.infer<typeof pricingSchema>;

const categoryOptions = [
  'screen', 'battery', 'camera', 'speaker', 'microphone', 'charging_port', 
  'button', 'sensor', 'motherboard', 'memory', 'housing', 'other'
];

export const DevicePartsManager: React.FC = () => {
  const [parts, setParts] = useState<DevicePart[]>([]);
  const [pricing, setPricing] = useState<PartPricing[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<DevicePart | null>(null);
  const [editingPricing, setEditingPricing] = useState<PartPricing | null>(null);
  const [selectedPartForPricing, setSelectedPartForPricing] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');

  // Filter parts based on selected model
  const filteredParts = selectedModelFilter === 'all' 
    ? parts 
    : parts.filter(part => part.model_id === selectedModelFilter);

  const partForm = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      model_id: '',
      name: '',
      description: '',
      category: '',
      image_url: '',
      estimated_duration: '',
      difficulty_level: 'medium',
      warranty_period: '1 year',
      display_order: 0,
      is_active: true
    }
  });

  const pricingForm = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      part_id: '',
      quality_type: 'aftermarket',
      quality_description: '',
      price: 0,
      labor_cost: 0,
      supplier: '',
      availability_status: 'in_stock',
      is_active: true
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [modelsResult, partsResult, pricingResult] = await Promise.all([
        supabase.from('device_models').select(`
          *,
          device_brands(name)
        `).eq('is_active', true).order('display_order'),
        supabase.from('device_parts').select(`
          *,
          device_models(name, device_brands(name))
        `).order('display_order'),
        supabase.from('part_pricing').select('*').order('price')
      ]);

      if (modelsResult.error) throw modelsResult.error;
      if (partsResult.error) throw partsResult.error;
      if (pricingResult.error) throw pricingResult.error;

      setModels(modelsResult.data || []);
      setParts(partsResult.data || []);
      setPricing(pricingResult.data || []);
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
    const filePath = `parts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('part-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('part-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onPartSubmit = async (data: PartFormData) => {
    try {
      setUploading(true);

      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const partData = { ...data, image_url: imageUrl };

      if (editingPart) {
        const { error } = await supabase
          .from('device_parts')
          .update(partData)
          .eq('id', editingPart.id);

        if (error) throw error;
        toast.success('Part updated successfully');
      } else {
        const { error } = await supabase
          .from('device_parts')
          .insert([partData as any]);

        if (error) throw error;
        toast.success('Part created successfully');
      }

      setPartDialogOpen(false);
      setEditingPart(null);
      setImageFile(null);
      partForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save part');
    } finally {
      setUploading(false);
    }
  };

  const onPricingSubmit = async (data: PricingFormData) => {
    try {
      if (editingPricing) {
        const { error } = await supabase
          .from('part_pricing')
          .update(data)
          .eq('id', editingPricing.id);

        if (error) throw error;
        toast.success('Pricing updated successfully');
      } else {
        const { error } = await supabase
          .from('part_pricing')
          .insert([data as any]);

        if (error) throw error;
        toast.success('Pricing created successfully');
      }

      setPricingDialogOpen(false);
      setEditingPricing(null);
      pricingForm.reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save pricing');
    }
  };

  const handlePartEdit = (part: DevicePart) => {
    setEditingPart(part);
    partForm.reset({
      model_id: part.model_id,
      name: part.name,
      description: part.description || '',
      category: part.category,
      image_url: part.image_url || '',
      estimated_duration: part.estimated_duration || '',
      difficulty_level: part.difficulty_level as any || 'medium',
      warranty_period: part.warranty_period || '1 year',
      display_order: part.display_order || 0,
      is_active: part.is_active
    });
    setPartDialogOpen(true);
  };

  const handlePricingEdit = (pricing: PartPricing) => {
    setEditingPricing(pricing);
    pricingForm.reset({
      part_id: pricing.part_id,
      quality_type: pricing.quality_type as any,
      quality_description: pricing.quality_description || '',
      price: pricing.price,
      labor_cost: pricing.labor_cost || 0,
      supplier: pricing.supplier || '',
      availability_status: pricing.availability_status as any || 'in_stock',
      is_active: pricing.is_active
    });
    setPricingDialogOpen(true);
  };

  const handlePartDelete = async (part: DevicePart) => {
    if (!confirm('Are you sure you want to delete this part? This will also delete all associated pricing.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('device_parts')
        .delete()
        .eq('id', part.id);

      if (error) throw error;
      toast.success('Part deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete part');
    }
  };

  const handlePricingDelete = async (pricing: PartPricing) => {
    if (!confirm('Are you sure you want to delete this pricing?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('part_pricing')
        .delete()
        .eq('id', pricing.id);

      if (error) throw error;
      toast.success('Pricing deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete pricing');
    }
  };

  if (loading) {
    return <div>Loading parts and pricing...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="parts">
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="parts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Device Parts</h3>
            <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingPart(null);
                  setImageFile(null);
                  partForm.reset();
                  setPartDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPart ? 'Edit Part' : 'Add New Part'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...partForm}>
                  <form onSubmit={partForm.handleSubmit(onPartSubmit)} className="space-y-4">
                    <FormField
                      control={partForm.control}
                      name="model_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={partForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Screen Assembly, Battery" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={partForm.control}
                      name="category"
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
                              {categoryOptions.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={partForm.control}
                        name="difficulty_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={partForm.control}
                        name="estimated_duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Duration</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 30-45 minutes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={partForm.control}
                        name="display_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={partForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Detailed description of the part" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={partForm.control}
                      name="warranty_period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warranty Period</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1 year, 6 months" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Image</FormLabel>
                      <ImageDropzone
                        onFileSelect={setImageFile}
                        currentImageUrl={partForm.watch('image_url')}
                        placeholder="Drop a part image here, or click to select"
                        disabled={uploading}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setPartDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : editingPart ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Device Parts</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="model-filter" className="text-sm font-medium">
                      Filter by Model:
                    </label>
                    <Select value={selectedModelFilter} onValueChange={setSelectedModelFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {filteredParts.length} part{filteredParts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        {part.image_url ? (
                          <img 
                            src={part.image_url} 
                            alt={part.name} 
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>
                        {models.find(m => m.id === part.model_id)?.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {part.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          part.difficulty_level === 'easy' ? 'default' : 
                          part.difficulty_level === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {part.difficulty_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{part.estimated_duration}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {part.display_order}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={part.is_active ? 'default' : 'secondary'}>
                          {part.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handlePartEdit(part)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handlePartDelete(part)}
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
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Part Pricing</h3>
            <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingPricing(null);
                  pricingForm.reset();
                  setPricingDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pricing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPricing ? 'Edit Pricing' : 'Add New Pricing'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...pricingForm}>
                  <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="space-y-4">
                    <FormField
                      control={pricingForm.control}
                      name="part_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a part" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parts.map((part) => (
                                <SelectItem key={part.id} value={part.id}>
                                  {part.name} - {models.find(m => m.id === part.model_id)?.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={pricingForm.control}
                      name="quality_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quality Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="original">Original</SelectItem>
                              <SelectItem value="oem">OEM</SelectItem>
                              <SelectItem value="aftermarket">Aftermarket</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={pricingForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={pricingForm.control}
                        name="labor_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Labor Cost ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={pricingForm.control}
                      name="quality_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quality Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Genuine OEM, High Quality" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setPricingDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingPricing ? 'Update' : 'Create'}
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
                    <TableHead>Part</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Part Price</TableHead>
                    <TableHead>Labor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing.map((price) => {
                    const part = parts.find(p => p.id === price.part_id);
                    const model = models.find(m => m.id === part?.model_id);
                    return (
                      <TableRow key={price.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{part?.name}</div>
                            <div className="text-sm text-muted-foreground">{model?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            price.quality_type === 'original' ? 'default' : 
                            price.quality_type === 'oem' ? 'secondary' : 'outline'
                          }>
                            {price.quality_type}
                          </Badge>
                        </TableCell>
                        <TableCell>${price.price}</TableCell>
                        <TableCell>${price.labor_cost}</TableCell>
                        <TableCell className="font-medium">
                          ${price.total_cost || (price.price + (price.labor_cost || 0))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            price.availability_status === 'in_stock' ? 'default' :
                            price.availability_status === 'low_stock' ? 'secondary' : 'destructive'
                          }>
                            {price.availability_status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={price.is_active ? 'default' : 'secondary'}>
                            {price.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handlePricingEdit(price)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePricingDelete(price)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

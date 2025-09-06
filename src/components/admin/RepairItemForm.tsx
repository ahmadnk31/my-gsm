import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Upload, Plus, Minus } from 'lucide-react';

interface PartVersion {
  type: 'original' | 'copy';
  price: number;
  quality: string;
}

interface PartWithVersions {
  name: string;
  versions: PartVersion[];
}

interface RepairItemFormData {
  name: string;
  description: string;
  device_type: string;
  device_model: string;
  parts_required: string[];
  part_versions: PartWithVersions[];
  estimated_price: number;
  estimated_duration: string;
  image: FileList | null;
}

interface RepairItemFormProps {
  onSuccess: () => void;
}

export const RepairItemForm: React.FC<RepairItemFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [parts, setParts] = useState<string[]>(['']);
  const [partsWithVersions, setPartsWithVersions] = useState<PartWithVersions[]>([
    { name: '', versions: [{ type: 'original', price: 0, quality: 'OEM' }] }
  ]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<RepairItemFormData>({
    defaultValues: {
      name: '',
      description: '',
      device_type: '',
      device_model: '',
      parts_required: [],
      part_versions: [],
      estimated_price: 0,
      estimated_duration: '',
      image: null,
    },
  });

  const addPart = () => {
    setParts([...parts, '']);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, value: string) => {
    const updatedParts = [...parts];
    updatedParts[index] = value;
    setParts(updatedParts);
  };

  const addPartWithVersions = () => {
    setPartsWithVersions([...partsWithVersions, { 
      name: '', 
      versions: [{ type: 'original', price: 0, quality: 'OEM' }] 
    }]);
  };

  const removePartWithVersions = (index: number) => {
    setPartsWithVersions(partsWithVersions.filter((_, i) => i !== index));
  };

  const updatePartWithVersions = (partIndex: number, field: keyof PartWithVersions, value: any) => {
    const updated = [...partsWithVersions];
    updated[partIndex] = { ...updated[partIndex], [field]: value };
    setPartsWithVersions(updated);
  };

  const addVersionToPart = (partIndex: number) => {
    const updated = [...partsWithVersions];
    updated[partIndex].versions.push({ type: 'copy', price: 0, quality: 'Aftermarket' });
    setPartsWithVersions(updated);
  };

  const removeVersionFromPart = (partIndex: number, versionIndex: number) => {
    const updated = [...partsWithVersions];
    updated[partIndex].versions = updated[partIndex].versions.filter((_, i) => i !== versionIndex);
    setPartsWithVersions(updated);
  };

  const updatePartVersion = (partIndex: number, versionIndex: number, field: keyof PartVersion, value: any) => {
    const updated = [...partsWithVersions];
    updated[partIndex].versions[versionIndex] = { 
      ...updated[partIndex].versions[versionIndex], 
      [field]: value 
    };
    setPartsWithVersions(updated);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('repair-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('repair-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSubmit = async (data: RepairItemFormData) => {
    setIsLoading(true);
    try {
      let image_url = null;

      // Upload image if provided
      if (data.image && data.image[0]) {
        image_url = await uploadImage(data.image[0]);
        if (!image_url) {
          toast.error('Failed to upload image');
          return;
        }
      }

      // Filter out empty parts
      const filteredParts = parts.filter(part => part.trim() !== '');
      
      // Filter out empty part versions
      const filteredPartVersions = partsWithVersions.filter(part => 
        part.name.trim() !== '' && part.versions.length > 0
      );

      const { error } = await supabase
        .from('repair_items')
        .insert({
          name: data.name,
          description: data.description,
          device_type: data.device_type,
          device_model: data.device_model,
          parts_required: filteredParts,
          part_versions: filteredPartVersions as any,
          estimated_price: data.estimated_price,
          estimated_duration: data.estimated_duration,
          image_url,
        });

      if (error) {
        throw error;
      }

      toast.success('Repair item added successfully');
      form.reset();
      setParts(['']);
      setPartsWithVersions([{ name: '', versions: [{ type: 'original', price: 0, quality: 'OEM' }] }]);
      setImagePreview(null);
      onSuccess();
    } catch (error) {
      console.error('Error adding repair item:', error);
      toast.error('Failed to add repair item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Repair Service</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a new repair service that customers can book. Fill in the service details, pricing, and part options.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Service Information</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Basic information about your repair service that customers will see when booking.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Screen Replacement, Battery Repair" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., iPhone, Samsung, Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., iPhone 14 Pro, Galaxy S23 Ultra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="99.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repair Time *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 30-60 minutes, 2-3 hours" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what the repair includes, any warranties, or special notes customers should know..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Part Options & Pricing</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Add different part quality options (Original, Copy, etc.) with their prices. Customers will see these options when booking.
                </p>
              </div>

              <div className="space-y-4">
              <Label>Parts Required</Label>
              {parts.map((part, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Part name"
                    value={part}
                    onChange={(e) => updatePart(index, e.target.value)}
                  />
                  {parts.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePart(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addPart}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>

            <div className="space-y-4">
                <Label className="text-base font-medium">Parts with Different Pricing Options</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add parts that have different quality/price options (e.g., Original vs Copy screen)
                </p>
                {partsWithVersions.map((part, partIndex) => (
                  <Card key={partIndex} className="p-4 bg-muted/20">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Part name (e.g., Screen Assembly, Battery)"
                          value={part.name}
                          onChange={(e) => updatePartWithVersions(partIndex, 'name', e.target.value)}
                          className="flex-1"
                        />
                        {partsWithVersions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePartWithVersions(partIndex)}
                            title="Remove this part"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <span>Price Options</span>
                          <span className="text-xs text-muted-foreground">(Add different quality/price versions)</span>
                        </Label>
                        {part.versions.map((version, versionIndex) => (
                          <div key={versionIndex} className="grid grid-cols-6 gap-2 items-center bg-background p-3 rounded border">
                            <div className="col-span-2">
                              <Label className="text-xs text-muted-foreground">Quality Type</Label>
                              <select
                                value={version.type}
                                onChange={(e) => updatePartVersion(partIndex, versionIndex, 'type', e.target.value)}
                                className="w-full px-2 py-1 border border-input rounded text-sm"
                              >
                                <option value="original">Original</option>
                                <option value="copy">Copy</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Price ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="150"
                                value={version.price}
                                onChange={(e) => updatePartVersion(partIndex, versionIndex, 'price', parseFloat(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs text-muted-foreground">Quality Description</Label>
                              <Input
                                placeholder="e.g., OEM, Aftermarket"
                                value={version.quality}
                                onChange={(e) => updatePartVersion(partIndex, versionIndex, 'quality', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            {part.versions.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeVersionFromPart(partIndex, versionIndex)}
                                className="h-8 w-8 p-0"
                                title="Remove this price option"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addVersionToPart(partIndex)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Price Option
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPartWithVersions}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Part
                </Button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Service Image (Optional)</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Upload an image that represents this repair service. This will be shown to customers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      form.setValue('image', e.target.files);
                      handleImageChange(e);
                    }}
                  />
                  {imagePreview && (
                    <div className="relative w-32 h-32">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? 'Creating Service...' : 'Create Repair Service'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
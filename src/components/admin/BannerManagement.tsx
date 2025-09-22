import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Calendar, 
  Palette, 
  Type, 
  Image, 
  Link,
  Sparkles,
  Percent,
  Bell,
  Gift,
  BarChart3,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Banner = Tables<'banners'>;

interface BannerFormData {
  type: 'promotion' | 'announcement' | 'feature' | 'seasonal';
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  background_color: string;
  text_color: string;
  priority: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const defaultFormData: BannerFormData = {
  type: 'promotion',
  title: '',
  subtitle: '',
  description: '',
  button_text: '',
  button_link: '',
  image_url: '',
  background_color: 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600',
  text_color: 'text-white',
  priority: 1,
  start_date: '',
  end_date: '',
  is_active: true
};

const backgroundColorOptions = [
  { 
    value: 'bg-gradient-to-r from-red-500 via-red-600 to-red-700', 
    label: 'Red Gradient (Promotion)', 
    preview: 'from-red-500 via-red-600 to-red-700',
    icon: <Percent className="h-4 w-4" />,
    description: 'Perfect for sales, discounts, and urgent offers'
  },
  { 
    value: 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600', 
    label: 'Blue-Purple Gradient (Feature)', 
    preview: 'from-blue-500 via-blue-600 to-purple-600',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Ideal for new features, innovations, and tech announcements'
  },
  { 
    value: 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600', 
    label: 'Green Gradient (Announcement)', 
    preview: 'from-green-500 via-green-600 to-emerald-600',
    icon: <Bell className="h-4 w-4" />,
    description: 'Great for important news, updates, and general announcements'
  },
  { 
    value: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600', 
    label: 'Orange-Pink Gradient (Seasonal)', 
    preview: 'from-orange-500 via-pink-500 to-purple-600',
    icon: <Gift className="h-4 w-4" />,
    description: 'Warm colors for holidays, celebrations, and seasonal events'
  },
  { 
    value: 'bg-gradient-to-r from-gray-700 to-gray-900', 
    label: 'Dark Gradient (Professional)', 
    preview: 'from-gray-700 to-gray-900',
    icon: <Type className="h-4 w-4" />,
    description: 'Professional and elegant for premium offerings'
  },
  { 
    value: 'bg-gradient-to-r from-indigo-500 to-purple-600', 
    label: 'Indigo-Purple (Premium)', 
    preview: 'from-indigo-500 to-purple-600',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Luxury feel for high-end products and services'
  }
];

const getBannerTypeInfo = (type: string) => {
  const typeMap = {
    promotion: { color: 'bg-red-500', textColor: 'text-white', icon: <Percent className="h-4 w-4" /> },
    feature: { color: 'bg-blue-500', textColor: 'text-white', icon: <Sparkles className="h-4 w-4" /> },
    announcement: { color: 'bg-green-500', textColor: 'text-white', icon: <Bell className="h-4 w-4" /> },
    seasonal: { color: 'bg-orange-500', textColor: 'text-white', icon: <Gift className="h-4 w-4" /> }
  };
  
  return typeMap[type as keyof typeof typeMap] || typeMap.promotion;
};

export const BannerManagement: React.FC = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [showForm, setShowForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Fetch all banners
  const { data: banners = [], isLoading, error } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      try {
        console.log('Fetching banners - User:', user);
        console.log('Fetching banners - User Role:', userRole);
        
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('priority', { ascending: true });

        console.log('Fetching banners - Supabase response data:', data);
        console.log('Fetching banners - Supabase response error:', error);

        if (error) {
          console.error('Error fetching banners:', error);
          // Return empty array instead of throwing error
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Unexpected error fetching banners:', err);
        return [];
      }
    },
    enabled: userRole === 'admin',
    retry: 1, // Only retry once
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  // Create banner mutation
  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: Omit<BannerFormData, 'start_date' | 'end_date'> & { start_date?: string; end_date?: string }) => {
      const { data, error } = await supabase
        .from('banners')
        .insert([{
          ...bannerData,
          start_date: bannerData.start_date && bannerData.start_date.trim() !== '' ? bannerData.start_date : null,
          end_date: bannerData.end_date && bannerData.end_date.trim() !== '' ? bannerData.end_date : null,
        }])
        .select();

      if (error) throw error;
      return data?.[0] || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
      toast({
        title: 'Success',
        description: 'Banner created successfully',
      });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating banner:', error);
      toast({
        title: 'Error',
        description: error.message?.includes('relation "public.banners" does not exist') 
          ? 'Banners table not found. Please run the database setup first.'
          : 'Failed to create banner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, ...bannerData }: Partial<BannerFormData> & { id: string }) => {
      console.log('Update mutation - ID:', id);
      console.log('Update mutation - Raw banner data:', bannerData);
      console.log('Update mutation - User:', user);
      console.log('Update mutation - User Role:', userRole);
      
      // Check if user is authenticated and has admin role
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (userRole !== 'admin') {
        throw new Error('Admin role required for banner updates');
      }
      
      const updatePayload = {
        ...bannerData,
        start_date: bannerData.start_date && bannerData.start_date.trim() !== '' ? bannerData.start_date : null,
        end_date: bannerData.end_date && bannerData.end_date.trim() !== '' ? bannerData.end_date : null,
      };
      
      console.log('Update mutation - Final payload:', updatePayload);
      
      const { data, error } = await supabase
        .from('banners')
        .update(updatePayload)
        .eq('id', id)
        .select();

      console.log('Update mutation - Supabase response data:', data);
      console.log('Update mutation - Supabase response error:', error);

      if (error) {
        console.error('Update mutation - Database error:', error);
        throw error;
      }
      
      // Check if the update query ran but returned no changes
      if (!data || data.length === 0) {
        // This could mean:
        // 1. The banner doesn't exist
        // 2. RLS policy blocked the update
        // 3. No actual changes were made
        
        // Let's try to fetch the banner to see if it exists
        const { data: existingBanner, error: fetchError } = await supabase
          .from('banners')
          .select('*')
          .eq('id', id)
          .single();
          
        console.log('Update mutation - Existing banner check:', existingBanner);
        console.log('Update mutation - Fetch error:', fetchError);
        
        if (fetchError) {
          throw new Error(`Banner not found or access denied: ${fetchError.message}`);
        }
        
        if (!existingBanner) {
          throw new Error('Banner not found - it may have been deleted');
        }
        
        // If banner exists but update didn't work, it's likely an RLS issue
        throw new Error('Update blocked - check permissions or try refreshing the page');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
      toast({
        title: 'Success',
        description: 'Banner updated successfully',
      });
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating banner:', error);
      const errorMessage = error?.message || 'Unknown error';
      const isPostgresError = errorMessage.includes('ERROR:');
      
      toast({
        title: 'Error',
        description: error.message?.includes('relation "public.banners" does not exist') 
          ? 'Banners table not found. Please run the database setup first.'
          : isPostgresError 
            ? `Database error: ${errorMessage}`
            : 'Failed to update banner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['active-banners'] });
      toast({
        title: 'Success',
        description: 'Banner deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive',
      });
      console.error('Error deleting banner:', error);
    },
  });

  // Toggle banner status
  const toggleBannerStatus = async (banner: Banner) => {
    updateBannerMutation.mutate({
      id: banner.id,
      is_active: !banner.is_active
    });
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingBanner(null);
    setShowForm(false);
    setActiveTab("list"); // Return to list after form operations
  };

  const startEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      type: banner.type as BannerFormData['type'],
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      image_url: banner.image_url || '',
      background_color: banner.background_color,
      text_color: banner.text_color,
      priority: banner.priority,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      is_active: banner.is_active
    });
    setShowForm(true);
    setActiveTab("create"); // Switch to create tab for editing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingBanner) {
      console.log('Updating banner with data:', { id: editingBanner.id, ...formData });
      updateBannerMutation.mutate({
        id: editingBanner.id,
        ...formData
      });
    } else {
      console.log('Creating banner with data:', formData);
      createBannerMutation.mutate(formData);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state if there are issues with the database
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              The banners table needs to be set up in your database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                It looks like the banners table hasn't been created yet. This happens when the database migration hasn't been run.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm">
              <p><strong>To fix this:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Run the database migrations in your Supabase project</li>
                <li>Ensure the banners table exists with the correct schema</li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Palette className="h-8 w-8" />
          Banner Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Create and manage promotional banners for your homepage. Design eye-catching campaigns that drive engagement.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Banner List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Banner
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">All Banners</h2>
              <p className="text-sm text-muted-foreground">
                {banners.length} banner{banners.length !== 1 ? 's' : ''} total • {banners.filter(b => b.is_active).length} active
              </p>
            </div>
            <Button onClick={() => {
              resetForm();
              setShowForm(true);
              setActiveTab("create");
            }} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </div>

          {banners.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first promotional banner to engage your customers
                </p>
                <Button onClick={() => {
                  resetForm();
                  setShowForm(true);
                  setActiveTab("create");
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Banner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {banners.map((banner) => {
                const typeInfo = getBannerTypeInfo(banner.type);
                return (
                  <Card key={banner.id} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeInfo.color} ${typeInfo.textColor}`}>
                            {typeInfo.icon}
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-3">
                              {banner.title}
                              <Badge 
                                variant={banner.type === 'promotion' ? 'destructive' : 
                                       banner.type === 'feature' ? 'default' : 
                                       banner.type === 'announcement' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {banner.type.toUpperCase()}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-4">
                              <span>Priority: {banner.priority}</span>
                              <span>•</span>
                              <span>Created: {new Date(banner.created_at).toLocaleDateString()}</span>
                              {banner.start_date && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(banner.start_date).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {banner.is_active ? (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBannerStatus(banner)}
                              title={banner.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(banner)}
                              title="Edit banner"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
                                  deleteBannerMutation.mutate(banner.id);
                                }
                              }}
                              title="Delete banner"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Preview */}
                      <div className={`p-6 rounded-xl bg-gradient-to-r ${banner.background_color.replace('bg-gradient-to-r ', '')} ${banner.text_color} mb-4 relative overflow-hidden`}>
                        {/* Background effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-white/10" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              {typeInfo.icon}
                            </div>
                            {banner.subtitle && (
                              <Badge className="bg-white/20 text-current border-white/30">
                                {banner.subtitle}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-xl mb-2">{banner.title}</h3>
                          <p className="opacity-90 mb-4">{banner.description}</p>
                          {banner.button_text && (
                            <Button className="bg-white/90 hover:bg-white text-gray-900 font-semibold" size="sm">
                              {banner.button_text}
                              {banner.button_link && <span className="ml-2">→</span>}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Banner Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-muted-foreground" />
                          <span>Type: {banner.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>Priority: {banner.priority}</span>
                        </div>
                        {banner.button_link && (
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{banner.button_link}</span>
                          </div>
                        )}
                        {banner.end_date && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span>Expires: {new Date(banner.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{banners.length}</div>
                <p className="text-xs text-muted-foreground">
                  {banners.filter(b => b.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banner Types</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['promotion', 'feature', 'announcement', 'seasonal'].map(type => {
                    const count = banners.filter(b => b.type === type).length;
                    const percentage = banners.length > 0 ? (count / banners.length) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((banners.filter(b => b.is_active).length / Math.max(banners.length, 1)) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Banners currently active
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Banner Timeline</CardTitle>
              <CardDescription>Scheduled and active banners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banners
                  .filter(b => b.start_date || b.end_date || b.is_active)
                  .sort((a, b) => new Date(a.start_date || a.created_at).getTime() - new Date(b.start_date || b.created_at).getTime())
                  .map((banner) => {
                    const typeInfo = getBannerTypeInfo(banner.type);
                    const now = new Date();
                    const startDate = banner.start_date ? new Date(banner.start_date) : null;
                    const endDate = banner.end_date ? new Date(banner.end_date) : null;
                    
                    let status = 'active';
                    if (startDate && now < startDate) status = 'scheduled';
                    if (endDate && now > endDate) status = 'expired';
                    if (!banner.is_active) status = 'inactive';

                    return (
                      <div key={banner.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded ${typeInfo.color} ${typeInfo.textColor}`}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{banner.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {startDate && `Starts: ${startDate.toLocaleDateString()}`}
                            {startDate && endDate && ' • '}
                            {endDate && `Ends: ${endDate.toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge 
                          className={
                            status === 'active' ? 'bg-green-100 text-green-800' :
                            status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingBanner ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </CardTitle>
                <CardDescription>
                  {editingBanner 
                    ? 'Update banner content and settings' 
                    : 'Design a new promotional banner for your homepage'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Banner Type</Label>
                        <Select value={formData.type} onValueChange={(value: BannerFormData['type']) => 
                          setFormData({ ...formData, type: value })
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promotion">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Promotion
                              </div>
                            </SelectItem>
                            <SelectItem value="feature">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Feature
                              </div>
                            </SelectItem>
                            <SelectItem value="announcement">
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Announcement
                              </div>
                            </SelectItem>
                            <SelectItem value="seasonal">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4" />
                                Seasonal
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority (1-100)</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                          min="1"
                          max="100"
                        />
                        <p className="text-xs text-muted-foreground">Lower numbers = higher priority</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter a compelling title..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="Optional subtitle or tagline..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Write a compelling description that motivates action..."
                        required
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Call to Action
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="button_text">Button Text</Label>
                        <Input
                          id="button_text"
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="Shop Now, Learn More, Get Started..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="button_link">Button Link</Label>
                        <Input
                          id="button_link"
                          value={formData.button_link}
                          onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                          placeholder="/accessories, /repairs, /contact..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL (Optional)</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/banner-image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use the enhanced no-image design with decorative elements
                      </p>
                    </div>
                  </div>

                  {/* Design & Styling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Design & Styling
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background_color">Background Style</Label>
                      <Select value={formData.background_color} onValueChange={(value) => 
                        setFormData({ ...formData, background_color: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {backgroundColorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-3 py-2">
                                <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${option.preview}`}></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    {option.icon}
                                    <span className="font-medium">{option.label}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{option.description}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Scheduling (Optional)
                    </h3>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Leave dates empty for permanent banners. Set dates to automatically show/hide banners during specific periods.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Activation */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <div>
                        <Label htmlFor="is_active" className="text-sm font-medium">
                          Activate Banner
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Toggle to make this banner visible on the homepage
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingBanner ? 'Update' : 'Create'} Banner
                      {(createBannerMutation.isPending || updateBannerMutation.isPending) && (
                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Live Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your banner will appear on the homepage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Banner Preview */}
                  <div className="space-y-4">
                    <div className={`relative overflow-hidden rounded-3xl shadow-xl min-h-[300px] ${formData.background_color} ${formData.text_color} group`}>
                      {/* Background effects */}
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
                        <div className="absolute inset-0 opacity-40">
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                          <div className="absolute top-1/2 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl" />
                        </div>
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-white/60 rounded-full animate-ping" />
                          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-20 p-8">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                          <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3">
                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 shadow-xl`}>
                                {getBannerTypeInfo(formData.type).icon}
                              </div>
                              <div className="space-y-2">
                                <Badge className="bg-white/20 text-current border-white/30 px-3 py-1">
                                  {formData.type.toUpperCase()}
                                </Badge>
                                {formData.subtitle && (
                                  <p className="text-current/90 text-sm font-medium">
                                    {formData.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <h2 className="text-2xl lg:text-4xl font-black leading-tight">
                              {formData.title || 'Your Banner Title'}
                            </h2>

                            <p className="text-current/85 text-lg leading-relaxed font-medium">
                              {formData.description || 'Your compelling banner description will appear here...'}
                            </p>

                            {formData.button_text && (
                              <div className="flex justify-center lg:justify-start pt-2">
                                <Button
                                  className="bg-white/95 hover:bg-white text-gray-900 font-bold px-8 py-3 rounded-2xl"
                                  size="lg"
                                >
                                  {formData.button_text}
                                  <span className="ml-2">→</span>
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0 relative">
                            {formData.image_url ? (
                              <div className="relative">
                                <img 
                                  src={formData.image_url} 
                                  alt="Banner preview"
                                  className="w-48 h-48 lg:w-64 lg:h-64 object-cover rounded-3xl shadow-2xl"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-48 h-48 lg:w-64 lg:h-64 relative">
                                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-20 blur-2xl animate-pulse" />
                                <div className="absolute inset-4 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center">
                                  <div className="text-4xl lg:text-6xl text-white/40">
                                    {getBannerTypeInfo(formData.type).icon}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Info */}
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Type:</strong> {formData.type}</p>
                      <p><strong>Priority:</strong> {formData.priority}</p>
                      {formData.start_date && <p><strong>Starts:</strong> {new Date(formData.start_date).toLocaleDateString()}</p>}
                      {formData.end_date && <p><strong>Ends:</strong> {new Date(formData.end_date).toLocaleDateString()}</p>}
                      <p><strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Design Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Keep titles short and punchy (under 50 characters)</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Use action-oriented button text like "Shop Now" or "Get Started"</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Choose colors that match your banner type for better engagement</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Set priority numbers to control which banners show first</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Use scheduling to run time-sensitive promotions automatically</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BannerManagement;

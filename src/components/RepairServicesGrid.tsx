import React, { useEffect, useState, Suspense, lazy } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

// Lazy load BookingModal
const BookingModal = lazy(() => import('@/components/booking/BookingModal').then(module => ({ default: module.BookingModal })));

// Fallback component for lazy-loaded modal
const ModalFallback = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

interface PartVersion {
  type: 'original' | 'copy';
  price: number;
  quality: string;
}

interface PartWithVersions {
  name: string;
  versions: PartVersion[];
}

interface RepairItem {
  id: string;
  name: string;
  description: string;
  device_type: string;
  device_model: string;
  parts_required: string[];
  part_versions: PartWithVersions[];
  estimated_price: number;
  estimated_duration: string;
  image_url: string | null;
  is_active: boolean;
}

export const RepairServicesGrid: React.FC = () => {
  const [repairItems, setRepairItems] = useState<RepairItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairItems();
  }, []);

  const fetchRepairItems = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRepairItems((data || []).map(item => ({
        ...item,
        part_versions: (item.part_versions as unknown as PartWithVersions[]) || []
      })));
    } catch (error) {
      console.error('Error fetching repair items:', error);
      toast.error('Failed to load repair services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {repairItems.map((item, index) => (
        <Card 
          key={item.id} 
          className="group relative bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="text-center pb-4">
            {item.image_url && (
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {item.name}
            </CardTitle>
            <div className="flex gap-2 justify-center flex-wrap">
              <Badge variant="secondary">{item.device_type}</Badge>
              <Badge variant="outline">{item.device_model}</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {item.description}
            </p>

            {item.part_versions && item.part_versions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Available Options:</span>
                </div>
                {item.part_versions.map((part, partIndex) => (
                  <div key={partIndex} className="space-y-2">
                    <h4 className="text-sm font-medium">{part.name}</h4>
                    <div className="space-y-1">
                      {part.versions.map((version, versionIndex) => (
                        <div key={versionIndex} className="flex justify-between items-center text-xs bg-muted/50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={version.type === 'original' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {version.type === 'original' ? 'Original' : 'Copy'}
                            </Badge>
                            <span className="text-muted-foreground">{version.quality}</span>
                          </div>
                          <span className="font-medium">${version.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-lg font-bold text-primary">From ${item.estimated_price}</div>
                  <div className="text-xs text-muted-foreground">Starting price</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{item.estimated_duration}</div>
                  <div className="text-xs text-muted-foreground">Repair time</div>
                </div>
              </div>
            </div>

            <Suspense fallback={
              <ModalFallback>
                <Button variant="default" className="w-full mt-4">
                  Book This Service
                </Button>
              </ModalFallback>
            }>
              <BookingModal>
                <Button variant="default" className="w-full mt-4">
                  Book This Service
                </Button>
              </BookingModal>
            </Suspense>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
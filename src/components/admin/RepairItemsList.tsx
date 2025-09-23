import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react';

interface RepairItem {
  id: string;
  name: string;
  description: string | null;
  device_type: string;
  device_model: string;
  parts_required: string[];
  estimated_price: number | null;
  estimated_duration: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface RepairItemsListProps {
  refreshTrigger: number;
}

export const RepairItemsList: React.FC<RepairItemsListProps> = ({ refreshTrigger }) => {
  const [items, setItems] = useState<RepairItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Error fetching repair items:', error);
      toast.error('Failed to load repair items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshTrigger]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('repair_items')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setItems(items.map(item => 
        item.id === id ? { ...item, is_active: !currentStatus } : item
      ));
      
      toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('repair_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (isLoading) {
    return <div>Loading repair items...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Repair Items ({items.length})</h3>
      
      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No repair items found. Add your first item above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {item.image_url && (
                    <div className="flex-shrink-0 self-center sm:self-start">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border mx-auto sm:mx-0"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3 sm:space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-2">
                      <div className="text-center sm:text-left">
                        <h4 className="font-semibold text-base sm:text-lg">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.device_type} • {item.device_model}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                        <Badge variant={item.is_active ? "default" : "secondary"} className="whitespace-nowrap">
                          {item.is_active ? "Active" : "Inactive"}
                        </Badge>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(item.id, item.is_active)}
                            className="p-2"
                          >
                            {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 text-center sm:text-left">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                      {item.estimated_price && (
                        <span className="font-medium text-primary">
                          ${item.estimated_price}
                        </span>
                      )}
                      
                      {item.estimated_duration && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          ⏱️ {item.estimated_duration}
                        </span>
                      )}
                    </div>
                    
                    {item.parts_required.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                        {item.parts_required.map((part, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {part}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
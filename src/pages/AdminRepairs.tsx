import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RepairItemForm } from '@/components/admin/RepairItemForm';
import { RepairItemsList } from '@/components/admin/RepairItemsList';
import { HierarchicalAdmin } from '@/components/admin/HierarchicalAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Layers } from 'lucide-react';

export default function AdminRepairs() {
  const { user, userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleItemAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Repair Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your custom repair items, services, and pricing
        </p>
      </div>

      <Tabs defaultValue="hierarchical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchical" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Device Management
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Add Legacy Item
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Legacy Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchical">
          <HierarchicalAdmin />
        </TabsContent>

        <TabsContent value="add">
          <RepairItemForm onSuccess={handleItemAdded} />
        </TabsContent>

        <TabsContent value="manage">
          <RepairItemsList refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
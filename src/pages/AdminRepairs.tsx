import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RepairItemForm } from '@/components/admin/RepairItemForm';
import { RepairItemsList } from '@/components/admin/RepairItemsList';
import { HierarchicalAdmin } from '@/components/admin/HierarchicalAdmin';
import { SEO, getPageSEOConfig } from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Layers } from 'lucide-react';

export default function AdminRepairs() {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const seoConfig = getPageSEOConfig('adminRepairs', t);

  if (!user) {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm sm:text-base">Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm sm:text-base">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleItemAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <SEO {...seoConfig} />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Repair Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your custom repair items, services, and pricing
        </p>
      </div>

      <Tabs defaultValue="hierarchical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 h-auto sm:h-10">
          <TabsTrigger value="hierarchical" className="flex items-center justify-center gap-2 text-sm">
            <Layers className="h-4 w-4" />
            <span className="hidden xs:inline">Device Management</span>
            <span className="xs:hidden">Devices</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center justify-center gap-2 text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden xs:inline">Add Legacy Item</span>
            <span className="xs:hidden">Add Item</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center justify-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden xs:inline">Manage Legacy Items</span>
            <span className="xs:hidden">Manage</span>
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
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Please sign in to access the admin panel.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleItemAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SEO {...seoConfig} />
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Repair Services Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your custom repair items, services, and pricing
          </p>
        </div>

        <Tabs defaultValue="hierarchical" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="hierarchical" className="flex items-center gap-2 py-2 sm:py-0">
              <Layers className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Device Management</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2 py-2 sm:py-0">
              <Package className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Add Legacy Item</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2 py-2 sm:py-0">
              <Settings className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Manage Legacy Items</span>
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
    </div>
  );
}
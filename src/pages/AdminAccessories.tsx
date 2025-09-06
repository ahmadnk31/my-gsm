import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessoryCategoriesManager } from '@/components/admin/AccessoryCategoriesManager';
import { AccessoryBrandsManager } from '@/components/admin/AccessoryBrandsManager';
import { AccessoriesManager } from '@/components/admin/AccessoriesManager';

export default function AdminAccessories() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accessories Management</h1>
          <p className="text-gray-600 mt-2">Manage accessory categories, brands, and products</p>
        </div>

        <Tabs defaultValue="accessories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
          </TabsList>

          <TabsContent value="accessories" className="space-y-6">
            <AccessoriesManager />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <AccessoryCategoriesManager />
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <AccessoryBrandsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

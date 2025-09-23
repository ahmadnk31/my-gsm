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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accessories Management</h1>
          <p className="text-gray-600 mt-2">Manage accessory categories, brands, and products</p>
        </div>

        <Tabs defaultValue="accessories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="accessories" className="py-2 sm:py-0">
              <span className="text-xs sm:text-sm">Accessories</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="py-2 sm:py-0">
              <span className="text-xs sm:text-sm">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="brands" className="py-2 sm:py-0">
              <span className="text-xs sm:text-sm">Brands</span>
            </TabsTrigger>
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

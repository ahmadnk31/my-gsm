import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Building2, 
  Monitor, 
  Package,
  Plus
} from 'lucide-react';
import { DeviceCategoriesManager } from './DeviceCategoriesManager';
import { DeviceBrandsManager } from './DeviceBrandsManager';
import { DeviceModelsManager } from './DeviceModelsManager';
import { DevicePartsManager } from './DevicePartsManager';

export const HierarchicalAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    {
      id: 'categories',
      label: 'Device Categories',
      icon: Smartphone,
      component: DeviceCategoriesManager
    },
    {
      id: 'brands',
      label: 'Brands',
      icon: Building2,
      component: DeviceBrandsManager
    },
    {
      id: 'models',
      label: 'Models',
      icon: Monitor,
      component: DeviceModelsManager
    },
    {
      id: 'parts',
      label: 'Parts & Pricing',
      icon: Package,
      component: DevicePartsManager
    }
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
            Device & Repair Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4 sm:mt-6">
                <tab.component />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

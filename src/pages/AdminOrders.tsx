import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminOrders() {
  const { user, userRole } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersManager />
      </div>
    </div>
  );
}

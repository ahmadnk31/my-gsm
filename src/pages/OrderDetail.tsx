import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ArrowLeft, 
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { formatPriceToEuro } from '@/lib/utils';

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrder(orderId);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: CreditCard },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      failed: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' },
      partially_refunded: { color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusTimeline = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Clock },
      { key: 'processing', label: 'Processing', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(step => step.key === status);
    
    return steps.map((step, index) => {
      const isCompleted = index <= currentStepIndex;
      const isCurrent = index === currentStepIndex;
      
      return (
        <div key={step.key} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isCompleted 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-400'
          }`}>
            <step.icon className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              isCompleted ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.label}
            </p>
            {isCurrent && (
              <p className="text-xs text-gray-500">
                {status === 'shipped' && order?.tracking_number && (
                  <>Tracking: {order.tracking_number}</>
                )}
                {status === 'delivered' && order?.delivered_at && (
                  <>Delivered on {new Date(order.delivered_at).toLocaleDateString()}</>
                )}
              </p>
            )}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-64 bg-gray-200 rounded w-96" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-2">Order #{order.order_number}</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getStatusTimeline(order.status)}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        {item.accessories.image_url && (
                          <img
                            src={item.accessories.image_url}
                            alt={item.accessories.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.accessories.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.accessories.accessory_brands?.name} • {item.accessories.accessory_categories?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPriceToEuro(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPriceToEuro(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{order.shipping_address.name}</div>
                      <div>{order.shipping_address.line1}</div>
                      {order.shipping_address.line2 && (
                        <div>{order.shipping_address.line2}</div>
                      )}
                      <div>{order.shipping_address.city}, {order.shipping_address.postal_code}</div>
                      <div>{order.shipping_address.country}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Notes */}
              {order.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Number:</span>
                    <span className="font-medium font-mono">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order Date:</span>
                    <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    {getPaymentStatusBadge(order.payment_status)}
                  </div>
                  {order.tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tracking:</span>
                      <span className="text-sm font-mono">{order.tracking_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPriceToEuro(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (21%):</span>
                      <span>{formatPriceToEuro(order.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPriceToEuro(order.shipping_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPriceToEuro(order.total_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/accessories">Continue Shopping</Link>
                  </Button>
                  {order.status === 'delivered' && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/support">Contact Support</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

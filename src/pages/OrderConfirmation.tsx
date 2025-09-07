import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowLeft, 
  Home,
  Calendar,
  CreditCard,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useOrder, useOrderBySessionId, useUpdateOrder } from '@/hooks/useOrders';
import { formatPriceToEuro } from '@/lib/utils';
import { toast } from 'sonner';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // Use different hooks based on whether we have orderId or sessionId
  const { data: orderById, isLoading: loadingById, error: errorById, refetch: refetchById } = useOrder(orderId || '');
  const { data: orderBySession, isLoading: loadingBySession, error: errorBySession, refetch: refetchBySession } = useOrderBySessionId(sessionId || '');
  
  const order = orderId ? orderById : orderBySession;
  const isLoading = orderId ? loadingById : loadingBySession;
  const error = orderId ? errorById : errorBySession;
  const refetch = orderId ? refetchById : refetchBySession;
  
  const updateOrderMutation = useUpdateOrder();
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Check payment status if order is still pending
  useEffect(() => {
    if (order && order.payment_status === 'pending' && order.stripe_session_id) {
      const checkPaymentStatus = async () => {
        setIsCheckingPayment(true);
        try {
          // Check if payment was successful by looking at the Stripe session
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-payment-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({
              sessionId: order.stripe_session_id
            })
          });

          if (response.ok) {
            const { paymentStatus } = await response.json();
            console.log('Payment status check result:', paymentStatus);
            if (paymentStatus === 'paid') {
              // Update order status
              await updateOrderMutation.mutateAsync({
                orderId: order.id,
                updates: {
                  payment_status: 'paid',
                  status: 'processing'
                }
              });
              toast.success('Payment confirmed! Your order is now being processed.');
              refetch(); // Refresh the order data
            }
          } else {
            console.error('Failed to check payment status:', response.status);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        } finally {
          setIsCheckingPayment(false);
        }
      };

      // Check immediately and then every 3 seconds for up to 1 minute
      checkPaymentStatus();
      const interval = setInterval(checkPaymentStatus, 3000);
      const timeout = setTimeout(() => clearInterval(interval), 60000); // 1 minute

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [order, updateOrderMutation, refetch]);

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

  // If we're looking for an order by session ID and it's not found yet, show a waiting message
  if (sessionId && !order && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-4">Processing Your Payment</h2>
            <p className="text-gray-600 mb-4">
              We're processing your payment and creating your order. This usually takes a few seconds.
            </p>
            <p className="text-sm text-gray-500">
              If this takes longer than a minute, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Error Loading Order</h2>
            <p className="text-gray-600 mb-4">There was an error loading your order. Please try again.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Processing Your Order</h2>
            <p className="text-gray-600 mb-4">
              Your payment was successful! We're processing your order and it will appear here shortly.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              This usually takes a few seconds. The page will update automatically.
            </p>
            <Button onClick={() => refetch()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Package },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: Package },
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

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: CreditCard },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: CreditCard },
    };

    const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        Payment {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Order Number</h4>
                  <p className="text-lg font-mono">{order.order_number}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Order Status</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {isCheckingPayment && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Checking payment...
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Order Date</h4>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Total Amount</h4>
                  <p className="text-lg font-bold">{formatPriceToEuro(order.total_amount)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Payment Status</h4>
                  <div className="mt-1">
                    {getPaymentStatusBadge(order.payment_status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-gray-600">We'll prepare your order for shipment within 1-2 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-gray-600">You'll receive a tracking number once your order ships.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-gray-600">Your order will arrive within 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Debug Section - Remove in production */}
          {order.payment_status === 'pending' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Payment Status Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 mb-4">
                  Your payment is being processed. If the status doesn't update automatically, 
                  the webhook might not be working properly.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => refetch()}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                  {order.stripe_session_id && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateOrderMutation.mutateAsync({
                            orderId: order.id,
                            updates: {
                              payment_status: 'paid',
                              status: 'processing'
                            }
                          });
                          toast.success('Status updated manually');
                          refetch();
                        } catch (error) {
                          toast.error('Failed to update status');
                        }
                      }}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Mark as Paid (Test)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                View All Orders
              </Link>
            </Button>
            <Button asChild>
              <Link to="/accessories" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

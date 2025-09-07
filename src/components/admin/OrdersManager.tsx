import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPriceToEuro } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: any;
  billing_address: any;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_items: OrderItem[];
  user?: {
    email: string;
    full_name?: string;
  };
}

interface OrderItem {
  id: string;
  order_id: string;
  accessory_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  accessories: {
    id: string;
    name: string;
    image_url?: string;
    accessory_categories?: {
      name: string;
    };
    accessory_brands?: {
      name: string;
    };
  };
}

export function OrdersManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tracking_number: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', searchQuery, statusFilter, paymentStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            accessories (
              id,
              name,
              image_url,
              accessory_categories (name),
              accessory_brands (name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[];
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
      setIsUpdateDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update order');
      console.error('Error updating order:', error);
    },
  });

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;

    const updates: Partial<Order> = {
      status: updateData.status,
      tracking_number: updateData.tracking_number,
      notes: updateData.notes,
    };

    // Set timestamps based on status
    if (updateData.status === 'shipped' && !selectedOrder.shipped_at) {
      updates.shipped_at = new Date().toISOString();
    }
    if (updateData.status === 'delivered' && !selectedOrder.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }

    updateOrderMutation.mutate({ orderId: selectedOrder.id, updates });
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      tracking_number: order.tracking_number || '',
      notes: order.notes || ''
    });
    setIsOrderDialogOpen(true);
  };

  const openUpdateDialog = () => {
    setIsUpdateDialogOpen(true);
  };

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

  const openStripeDashboard = () => {
    if (selectedOrder?.stripe_payment_intent_id) {
      window.open(`https://dashboard.stripe.com/payments/${selectedOrder.stripe_payment_intent_id}`, '_blank');
    } else {
      toast.error('No Stripe payment ID available');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order Management</h2>
          <p className="text-gray-600">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={openStripeDashboard}
            disabled={!selectedOrder?.stripe_payment_intent_id}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe Dashboard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by order number or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {order.user?.email || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.payment_status)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPriceToEuro(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Order details and management
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order Number:</span>
                      <span className="font-medium">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      {getPaymentStatusBadge(selectedOrder.payment_status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tracking:</span>
                        <span className="text-sm font-mono">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span>{formatPriceToEuro(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax:</span>
                      <span>{formatPriceToEuro(selectedOrder.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Shipping:</span>
                      <span>{formatPriceToEuro(selectedOrder.shipping_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatPriceToEuro(selectedOrder.total_amount)}</span>
                    </div>
                    {selectedOrder.stripe_payment_intent_id && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openStripeDashboard}
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View in Stripe Dashboard
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>{selectedOrder.shipping_address.name}</div>
                      <div>{selectedOrder.shipping_address.line1}</div>
                      {selectedOrder.shipping_address.line2 && (
                        <div>{selectedOrder.shipping_address.line2}</div>
                      )}
                      <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}</div>
                      <div>{selectedOrder.shipping_address.country}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items.map((item) => (
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

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Order Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={openUpdateDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>
              Update order status and tracking information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={updateData.tracking_number}
                onChange={(e) => setUpdateData(prev => ({ ...prev, tracking_number: e.target.value }))}
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add order notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateOrder}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

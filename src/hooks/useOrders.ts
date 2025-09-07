import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
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
}

export interface OrderItem {
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

// Fetch user's orders
export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[];
    },
    enabled: !!userId,
  });
};

// Fetch single order
export const useOrder = (orderId?: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
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
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      return data as Order;
    },
    enabled: !!orderId,
  });
};

// Fetch order by Stripe session ID
export const useOrderBySessionId = (sessionId: string) => {
  return useQuery({
    queryKey: ['order-by-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('stripe_session_id', sessionId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('Error fetching order by session ID:', error);
        // Don't throw error for "no rows" - this is expected when webhook hasn't processed yet
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      // Return null if no order found (webhook hasn't processed yet)
      return data as Order | null;
    },
    enabled: !!sessionId,
    refetchInterval: 2000, // Check every 2 seconds until order is found
    refetchIntervalInBackground: false,
  });
};

// Create order from cart
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      items,
      shippingInfo,
      totalAmount,
      status = 'pending',
    }: {
      userId: string;
      items: Array<{
        accessoryId: string;
        quantity: number;
        price: number;
      }>;
      shippingInfo: any;
      totalAmount: number;
      status?: string;
    }) => {
      // Calculate subtotal, tax, and shipping
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.21; // 21% VAT
      const taxAmount = subtotal * taxRate;
      const shippingAmount = subtotal < 50 ? 5.99 : 0;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          shipping_address: shippingInfo,
          billing_address: shippingInfo,
          status,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        accessory_id: item.accessoryId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Clean up the order if items creation failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      return order;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      toast.success('Order created - redirecting to payment...');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    },
  });
};

// Update order status
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      updates,
    }: {
      orderId: string;
      updates: Partial<Order>;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    },
  });
};

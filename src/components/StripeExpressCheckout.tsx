import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatPriceToEuro } from '@/lib/utils';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51PyIbqCwfSQS5OH394wBk28TrLwsuro4pTjK57ydwwUNkrn2rNSQlpYxlnw41uL8q3me60xrmbn2bXNAtLouJj6V00o0bp0ysz';
const stripePromise = loadStripe(stripeKey);

interface CartItem {
  id: string;
  quantity: number;
  accessories: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

interface StripeExpressCheckoutProps {
  cartItems: CartItem[];
  onPaymentSuccess: (orderId: string) => void;
}

export default function StripeExpressCheckout({ cartItems, onPaymentSuccess }: StripeExpressCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Belgium'
  });

  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.accessories.price * item.quantity), 0);
  const taxRate = 0.21; // 21% VAT
  const taxAmount = subtotal * taxRate;
  const shippingAmount = subtotal < 50 ? 5.99 : 0;
  const totalAmount = subtotal + taxAmount + shippingAmount;

  const handleExpressCheckout = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    // Validate shipping info
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe Checkout Session (order will be created in webhook when payment succeeds)
      const authKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      console.log('Auth key exists:', !!authKey);
      console.log('Auth key value:', authKey?.substring(0, 20) + '...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`
        },
        body: JSON.stringify({
          userId: user.id,
          items: cartItems.map(item => ({
            accessoryId: item.accessories.id,
            name: item.accessories.name,
            price: item.accessories.price,
            quantity: item.quantity,
            image: item.accessories.image_url
          })),
          shippingInfo,
          totalAmount: Math.round(totalAmount * 100), // Convert to cents
          successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      console.log('Stripe checkout session created:', { sessionId });

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={shippingInfo.firstName}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={shippingInfo.lastName}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={shippingInfo.postalCode}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, country: e.target.value }))}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPriceToEuro(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (21%):</span>
            <span>{formatPriceToEuro(taxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{shippingAmount > 0 ? formatPriceToEuro(shippingAmount) : 'Free'}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatPriceToEuro(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Express Checkout Button */}
      <Button
        onClick={handleExpressCheckout}
        disabled={isProcessing}
        className="w-full bg-[#635BFF] hover:bg-[#5A52E5] text-white py-6 text-lg font-semibold"
      >
        {isProcessing ? 'Processing...' : 'Pay with Stripe Express Checkout'}
      </Button>
      
      <p className="text-sm text-gray-600 text-center">
        You'll be redirected to Stripe's secure checkout page to complete your payment.
      </p>
    </div>
  );
}

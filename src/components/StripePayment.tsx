import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatPriceToEuro } from '@/lib/utils';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51PyIbqCwfSQS5OH394wBk28TrLwsuro4pTjK57ydwwUNkrn2rNSQlpYxlnw41uL8q3me60xrmbn2bXNAtLouJj6V00o0bp0ysz';
console.log('Stripe key loaded:', !!stripeKey);
console.log('Stripe key value:', stripeKey?.substring(0, 20) + '...');

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

interface StripePaymentProps {
  cartItems: CartItem[];
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<StripePaymentProps> = ({ cartItems, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'BE',
  });
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    line1: '',
    line2: '',
    city: '',
    postal_code: '',
    country: 'BE',
  });
  const [notes, setNotes] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(true);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.accessories.price * item.quantity), 0);
  const taxRate = 0.21; // 21% VAT
  const taxAmount = subtotal * taxRate;
  const shippingAmount = subtotal < 50 ? 5.99 : 0;
  const totalAmount = subtotal + taxAmount + shippingAmount;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      console.error('Stripe not initialized:', { stripe: !!stripe, elements: !!elements, user: !!user });
      toast.error('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      toast.error('Stripe configuration missing. Please contact support.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const orderId = await createOrderMutation.mutateAsync({
        userId: user.id,
        items: cartItems.map(item => ({
          accessoryId: item.accessories.id,
          quantity: item.quantity,
          price: item.accessories.price,
        })),
        shippingInfo: {
          ...shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : billingAddress,
          notes,
        },
        totalAmount,
      });

      // Create Stripe payment intent
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'eur',
          orderId,
          metadata: {
            orderId,
            userId: user.id,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment intent creation failed:', response.status, errorText);
        throw new Error(`Failed to create payment intent: ${response.status} ${errorText}`);
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found. Please check your Stripe configuration.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: shippingAddress.name,
            address: useSameAddress ? shippingAddress : billingAddress,
          },
        },
      });

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess(orderId.id);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              {item.accessories.image_url && (
                <img
                  src={item.accessories.image_url}
                  alt={item.accessories.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.accessories.name}</h4>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPriceToEuro(item.accessories.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2 text-sm">
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
              <span>{formatPriceToEuro(shippingAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatPriceToEuro(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping-name">Full Name</Label>
              <Input
                id="shipping-name"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="shipping-postal">Postal Code</Label>
              <Input
                id="shipping-postal"
                value={shippingAddress.postal_code}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shipping-line1">Address Line 1</Label>
              <Input
                id="shipping-line1"
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="shipping-line2">Address Line 2 (Optional)</Label>
              <Input
                id="shipping-line2"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="shipping-city">City</Label>
              <Input
                id="shipping-city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="shipping-country">Country</Label>
              <Input
                id="shipping-country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="same-address"
              checked={useSameAddress}
              onChange={(e) => setUseSameAddress(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="same-address">Same as shipping address</Label>
          </div>
          
          {!useSameAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing-name">Full Name</Label>
                <Input
                  id="billing-name"
                  value={billingAddress.name}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="billing-postal">Postal Code</Label>
                <Input
                  id="billing-postal"
                  value={billingAddress.postal_code}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="billing-line1">Address Line 1</Label>
                <Input
                  id="billing-line1"
                  value={billingAddress.line1}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="billing-line2">Address Line 2 (Optional)</Label>
                <Input
                  id="billing-line2"
                  value={billingAddress.line2}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, line2: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="billing-city">City</Label>
                <Input
                  id="billing-city"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="billing-country">Country</Label>
                <Input
                  id="billing-country"
                  value={billingAddress.country}
                  onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for your order..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPriceToEuro(totalAmount)}`}
        </Button>
      </div>
    </form>
  );
};

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

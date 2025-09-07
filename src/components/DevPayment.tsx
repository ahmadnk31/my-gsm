import React, { useState } from 'react';
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

interface DevPaymentProps {
  cartItems: CartItem[];
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const DevPayment: React.FC<DevPaymentProps> = ({ cartItems, onSuccess, onCancel }) => {
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
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.accessories.price * item.quantity), 0);
  const taxRate = 0.21; // 21% VAT
  const taxAmount = subtotal * taxRate;
  const shippingAmount = subtotal < 50 ? 5.99 : 0;
  const totalAmount = subtotal + taxAmount + shippingAmount;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderId = await createOrderMutation.mutateAsync({
        userId: user.id,
        shippingAddress,
        billingAddress: useSameAddress ? shippingAddress : billingAddress,
        notes,
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment success
      toast.success('Payment successful! (Development Mode)');
      onSuccess(orderId);
    } catch (error) {
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
            Payment Information (Development Mode)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                placeholder="4242 4242 4242 4242"
                required
              />
            </div>
            <div>
              <Label htmlFor="card-expiry">Expiry Date</Label>
              <Input
                id="card-expiry"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                placeholder="123"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            <span>This is a development payment form. No real payment will be processed.</span>
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
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPriceToEuro(totalAmount)} (Dev Mode)`}
        </Button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useAccessories';
import StripeExpressCheckout from '@/components/StripeExpressCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Checkout() {
  const { user } = useAuth();
  const { data: cartItems = [], isLoading } = useCart(user?.id);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = (orderId: string) => {
    toast.success('Order placed successfully!');
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentCancel = () => {
    navigate('/cart');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to proceed with checkout.</p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some accessories to your cart before checking out.</p>
            <Button asChild>
              <Link to="/accessories">Browse Accessories</Link>
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
            <Link to="/cart" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        {/* Checkout Form */}
        <div className="max-w-4xl mx-auto">
          <StripeExpressCheckout
            cartItems={cartItems}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </div>
  );
}

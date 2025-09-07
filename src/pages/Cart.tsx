import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  Shield,
  Loader2
} from "lucide-react";
import { 
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart
} from '@/hooks/useAccessories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Cart() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading } = useCart(user?.id);
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.accessories.price * item.quantity);
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (accessoryId: string, newQuantity: number) => {
    if (!user) return;

    updateQuantityMutation.mutate({
      userId: user.id,
      accessoryId,
      quantity: newQuantity
    });
  };

  const handleRemoveItem = (accessoryId: string) => {
    if (!user) return;

    removeFromCartMutation.mutate({
      userId: user.id,
      accessoryId
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Please log in to view your cart</h3>
            <p className="text-gray-500 mb-4">You need to be logged in to access your shopping cart.</p>
            <Link to="/auth">
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/accessories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
{t('cart.continueShopping')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('cart.itemsInCart', { count: cartItems.length })}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('cart.empty')}</h3>
            <p className="text-gray-500 mb-4">{t('cart.emptyDescription')}</p>
            <Link to="/accessories">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Accessories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.accessories.image_url ? (
                          <img
                            src={item.accessories.image_url}
                            alt={item.accessories.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/accessories/product?category=${item.accessories.accessory_categories?.slug || 'uncategorized'}&product=${item.accessories.slug || item.accessories.id}`}>
                          <h3 className="font-semibold text-sm hover:text-primary line-clamp-2">
                            {item.accessories.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.accessories.accessory_brands?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">★</span>
                            <span className="text-xs font-medium">{item.accessories.rating}</span>
                            <span className="text-xs text-muted-foreground">({item.accessories.review_count})</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.accessories.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.accessories.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right min-w-0">
                        <p className="font-semibold text-sm">
                          ${(item.accessories.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.accessories.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.accessories.id)}
                        disabled={removeFromCartMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  {shipping === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      <Truck className="h-4 w-4" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      <Truck className="h-4 w-4" />
                      <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping</span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cartItems.length === 0}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
{t('cart.checkout')}
                      </>
                    )}
                  </Button>

                  {/* Security Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our customer service team is here to help with any questions about your order.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3 text-muted-foreground" />
                      <span>Free returns within 30 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <span>1-year warranty on all products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span>Same-day shipping available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

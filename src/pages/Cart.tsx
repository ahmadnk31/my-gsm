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
import { formatPriceToEuro } from '@/lib/utils';

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
      toast.error(t('cart.pleaseLogInToCheckout'));
      return;
    }

    if (cartItems.length === 0) {
      toast.error(t('cart.yourCartIsEmpty'));
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
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('cart.pleaseLogInToViewCart')}</h3>
            <p className="text-gray-500 mb-4">{t('cart.needToBeLoggedIn')}</p>
            <Link to="/auth">
              <Button>{t('cart.logIn')}</Button>
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
        <div className="mb-6 sm:mb-8">
          <Link to="/accessories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('cart.continueShopping')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {t('cart.itemsInCart', { count: cartItems.length })}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">{t('cart.empty')}</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 px-4">{t('cart.emptyDescription')}</p>
            <Link to="/accessories">
              <Button className="px-4 py-2 sm:px-6 sm:py-3">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t('cart.browseAccessories')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{t('cart.cartItems')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 sm:p-4">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-3">
                        {/* Product Info - Mobile */}
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.accessories.image_url ? (
                              <img
                                src={item.accessories.image_url}
                                alt={item.accessories.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/accessories/product?category=${item.accessories.accessory_categories?.slug || 'uncategorized'}&product=${item.accessories.slug || item.accessories.id}`}>
                              <h3 className="font-semibold text-sm hover:text-primary line-clamp-2">
                                {item.accessories.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {item.accessories.accessory_brands?.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs">★</span>
                              <span className="text-xs font-medium">{item.accessories.rating}</span>
                              <span className="text-xs text-muted-foreground">({item.accessories.review_count} {t('cart.reviews')})</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.accessories.id)}
                            disabled={removeFromCartMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                            aria-label={t('cart.removeFromCart')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Quantity and Price - Mobile */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.accessories.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                              className="h-8 w-8 p-0"
                              aria-label={t('cart.decreaseQuantity')}
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
                              className="h-8 w-8 p-0"
                              aria-label={t('cart.increaseQuantity')}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              {formatPriceToEuro(item.accessories.price * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPriceToEuro(item.accessories.price)} {t('cart.each')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center gap-4">
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
                              <span className="text-xs text-muted-foreground">({item.accessories.review_count} {t('cart.reviews')})</span>
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
                            className="h-8 w-8 p-0"
                            aria-label={t('cart.decreaseQuantity')}
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
                            className="h-8 w-8 p-0"
                            aria-label={t('cart.increaseQuantity')}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-0">
                          <p className="font-semibold text-sm">
                            {formatPriceToEuro(item.accessories.price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPriceToEuro(item.accessories.price)} {t('cart.each')}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.accessories.id)}
                          disabled={removeFromCartMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          aria-label={t('cart.removeFromCart')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{t('cart.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('cart.subtotal')} ({cartItems.length} {t('cart.items')})</span>
                      <span>{formatPriceToEuro(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('cart.shipping')}</span>
                      <span>{shipping === 0 ? t('cart.freeShipping') : formatPriceToEuro(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('cart.tax')}</span>
                      <span>{formatPriceToEuro(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>{t('cart.total')}</span>
                      <span>{formatPriceToEuro(total)}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  {shipping === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      <Truck className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{t('cart.freeShippingOver50')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                      <Truck className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{t('cart.addMoreForFreeShipping', { amount: formatPriceToEuro(50 - subtotal) })}</span>
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
                        {t('cart.processing')}
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
                    <span>{t('cart.secureCheckoutSSL')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">{t('cart.needHelp')}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    {t('cart.customerServiceHelp')}
                  </p>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span>{t('cart.freeReturns30Days')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span>{t('cart.oneYearWarranty')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span>{t('cart.sameDayShippingAvailable')}</span>
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

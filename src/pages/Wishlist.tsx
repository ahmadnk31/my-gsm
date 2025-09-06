import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  Package,
  Star,
  Loader2,
  Plus
} from "lucide-react";
import { 
  useWishlist,
  useRemoveFromWishlist,
  useAddToCart
} from '@/hooks/useAccessories';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Wishlist() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: wishlistItems = [], isLoading } = useWishlist(user?.id);
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleRemoveFromWishlist = (accessoryId: string) => {
    if (!user) return;

    removeFromWishlistMutation.mutate({
      userId: user.id,
      accessoryId
    });
  };

  const handleAddToCart = async (accessoryId: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    setAddingToCart(accessoryId);
    
    try {
      await addToCartMutation.mutateAsync({
        userId: user.id,
        accessoryId,
        quantity: 1
      });
      
      // Remove from wishlist after adding to cart
      removeFromWishlistMutation.mutate({
        userId: user.id,
        accessoryId
      });
      
      toast.success('Added to cart and removed from wishlist');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddAllToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    if (wishlistItems.length === 0) {
      toast.error('Your wishlist is empty');
      return;
    }

    setAddingToCart('all');
    
    try {
      // Add all items to cart
      for (const item of wishlistItems) {
        await addToCartMutation.mutateAsync({
          userId: user.id,
          accessoryId: item.accessories.id,
          quantity: 1
        });
      }
      
      // Remove all items from wishlist
      for (const item of wishlistItems) {
        removeFromWishlistMutation.mutate({
          userId: user.id,
          accessoryId: item.accessories.id
        });
      }
      
      toast.success('All items added to cart and removed from wishlist');
    } catch (error) {
      toast.error('Failed to add some items to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Please log in to view your wishlist</h3>
            <p className="text-gray-500 mb-4">You need to be logged in to access your wishlist.</p>
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
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('wishlist.title')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('wishlist.itemsInWishlist', { count: wishlistItems.length })}
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Button
                onClick={handleAddAllToCart}
                disabled={addingToCart === 'all'}
                className="flex items-center gap-2"
              >
                {addingToCart === 'all' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding All...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add All to Cart
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('wishlist.empty')}</h3>
            <p className="text-gray-500 mb-4">{t('wishlist.emptyDescription')}</p>
            <Link to="/accessories">
              <Button>
                <Heart className="h-4 w-4 mr-2" />
                Browse Accessories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {item.accessories.image_url ? (
                    <img
                      src={item.accessories.image_url}
                      alt={item.accessories.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item.accessories.id)}
                      disabled={addingToCart === item.accessories.id}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    >
                      {addingToCart === item.accessories.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.accessories.id)}
                      disabled={removeFromWishlistMutation.isPending}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    {item.accessories.is_featured && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">Featured</Badge>
                    )}
                    {item.accessories.stock_quantity <= 0 && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Link to={`/accessories/${item.accessories.accessory_categories?.slug || 'uncategorized'}/${item.accessories.slug || item.accessories.id}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">
                        {item.accessories.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground">
                      {item.accessories.accessory_brands?.name}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{item.accessories.rating}</span>
                      <span className="text-xs text-muted-foreground">({item.accessories.review_count})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">${item.accessories.price}</span>
                      {item.accessories.original_price && item.accessories.original_price > item.accessories.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${item.accessories.original_price}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="text-xs">
                      {item.accessories.stock_quantity > 0 ? (
                        <span className="text-green-600">In Stock ({item.accessories.stock_quantity} available)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(item.accessories.id)}
                        disabled={addingToCart === item.accessories.id || item.accessories.stock_quantity <= 0}
                      >
                        {addingToCart === item.accessories.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(item.accessories.id)}
                        disabled={removeFromWishlistMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State Suggestions */}
        {wishlistItems.length === 0 && (
          <div className="mt-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Popular Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Phone Cases', icon: 'Shield', href: '/accessories?categories=cases' },
                    { name: 'Chargers', icon: 'Zap', href: '/accessories?categories=chargers' },
                    { name: 'Screen Protectors', icon: 'Shield', href: '/accessories?categories=protection' },
                    { name: 'Audio', icon: 'Headphones', href: '/accessories?categories=audio' }
                  ].map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-center">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

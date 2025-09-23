import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface BentoProductCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
  link: string;
  imageHeight?: string;
  size?: 'standard' | 'large' | 'tall' | 'wide';
}

const BentoProductCard: React.FC<BentoProductCardProps> = ({
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  features,
  link,
  imageHeight = "h-64",
  size = "standard"
}) => {
  const isLarge = size === 'large';
  const isTall = size === 'tall';
  
  return (
    <Card className="group overflow-hidden bg-background border-border/50 hover:border-border transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
      <div className="relative overflow-hidden">
        <div className={`${imageHeight} relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Discount badge */}
          {originalPrice && (
            <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg">
              Sale
            </Badge>
          )}
          
          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Heart className="h-4 w-4" />
          </Button>
          
          {/* Features overlay for large cards */}
          {isLarge && features.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2">
                {features.slice(0, 2).map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-background/90 text-foreground border-0 text-xs backdrop-blur-sm"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        {/* Product Info */}
        <div className="space-y-3">
          <h3 className={`font-semibold text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary ${
            isLarge ? 'text-xl' : 'text-lg'
          }`}>
            {name}
          </h3>
          
          {/* Rating and Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviews.toLocaleString()})
            </span>
          </div>

          {/* Features for non-large cards */}
          {!isLarge && features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.slice(0, isTall ? 3 : 2).map((feature, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-border/50 text-muted-foreground"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Price and Action */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-primary ${
              isLarge ? 'text-2xl' : 'text-xl'
            }`}>
              {price}
            </span>
            {originalPrice && (
              <span className="text-muted-foreground line-through text-sm">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 group/btn"
            >
              <Link to={link} className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>{price.includes('From') ? 'Explore' : 'Add to Cart'}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BentoProductCard;

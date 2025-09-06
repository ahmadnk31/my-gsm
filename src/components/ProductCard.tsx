import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
  link?: string;
}

const ProductCard = ({ name, price, originalPrice, image, rating, reviews, features, link }: ProductCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const cardContent = (
    <Card className="group overflow-hidden bg-card shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 p-6">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-500"
          />
          {originalPrice && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-medium z-10">
              Sale
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < rating ? 'text-warning fill-current' : 'text-muted'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>

          {/* Features */}
          <div className="mb-4">
            {features && features.slice(0, 2).map((feature, index) => (
              <div key={index} className="text-sm text-muted-foreground mb-1">
                • {feature}
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-primary">{price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>
            )}
          </div>

          {/* View Details Button */}
          <Button variant="outline" className="w-full btn-ghost group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // If link is provided, wrap the card in a Link component
  if (link) {
    return (
      <Link to={link} onClick={handleCardClick} className="block">
        {cardContent}
      </Link>
    );
  }

  // Otherwise, return the card as is
  return cardContent;
};

export default ProductCard;
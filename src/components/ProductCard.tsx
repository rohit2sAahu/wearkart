import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/database";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400';

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product.id });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              -{discount}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity",
                inWishlist && "text-destructive"
              )}
              onClick={handleToggleWishlist}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </Button>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/product/${product.slug}`}>
          {product.brand && (
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < 4 ? "fill-warning text-warning" : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(4.0)</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price.toFixed(2)}
          </span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          disabled={isAddingToCart || product.stock_quantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

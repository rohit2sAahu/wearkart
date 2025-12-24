import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, Watch, ShoppingBag } from "lucide-react";
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

  // Determine category icon based on product category
  const isWatch = product.categories?.name?.toLowerCase().includes('watch');
  const CategoryIcon = isWatch ? Watch : ShoppingBag;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product.id });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <Card className="group overflow-hidden border-border/30 bg-card/50 glass hover:glow-border transition-all duration-500 hover:-translate-y-2">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground font-bold shadow-lg">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-gradient-orange text-primary-foreground shadow-glow">
                Featured
              </Badge>
            )}
          </div>
          
          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full glass">
              <CategoryIcon className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          {/* Wishlist button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute bottom-3 right-3 glass opacity-0 group-hover:opacity-100 transition-all duration-300",
                inWishlist && "text-destructive bg-destructive/10"
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
            <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">{product.brand}</p>
          )}
          <h3 className="font-semibold font-display text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-3">
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
          <span className="text-xs text-muted-foreground">(4.0)</span>
        </div>
        
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-display text-gradient">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full bg-gradient-orange hover:opacity-90 text-primary-foreground shadow-glow"
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
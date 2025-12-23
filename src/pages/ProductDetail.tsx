import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ProductGrid } from "@/components/ProductGrid";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart, isAddingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: relatedProducts } = useProducts({
    category: product?.categories?.slug,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400';

  const related = (relatedProducts || []).filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to products
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative animate-fade-in">
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/30">
              <img
                src={primaryImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6 animate-slide-up">
            <div>
              {product.brand && (
                <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? "fill-warning text-warning" : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  4.0 ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description || product.short_description}
            </p>

            {/* Stock Status */}
            <div>
              {product.stock_quantity > 0 ? (
                <Badge variant="outline" className="text-success border-success">
                  In Stock ({product.stock_quantity} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
            
            {/* Features */}
            <div className="grid gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>1-year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span>7-day return policy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <ProductGrid products={related} title="You May Also Like" />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;

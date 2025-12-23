import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";

const Cart = () => {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, isLoading } = useCart();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Please login to view cart</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to add items to your cart and checkout.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Login / Sign Up
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/">
                Start Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shipping = totalPrice > 500 ? 0 : 50;
  const orderTotal = totalPrice + shipping;

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const price = item.product_variants?.price ?? item.products?.price ?? 0;
              const name = item.products?.name ?? "Product";
              const slug = item.products?.slug ?? item.product_id;
              
              return (
                <Card
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link to={`/product/${slug}`}>
                        <div className="h-24 w-24 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                          <img
                            src="/placeholder.svg"
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${slug}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{price.toFixed(2)} each
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-foreground">
                              ₹{(price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleClearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-foreground">₹{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Add ₹{(500 - totalPrice).toFixed(2)} more for free shipping!
                  </p>
                )}
                
                <Button variant="hero" size="xl" className="w-full mt-6" asChild>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to="/">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;

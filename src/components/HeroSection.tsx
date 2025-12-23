import { ArrowRight, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              🔥 Holiday Sale - Up to 50% Off
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Discover Amazing
              <span className="text-primary block">Products Today</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Shop millions of products from trusted sellers. Free shipping on orders over $50. 
              Quality guaranteed or your money back.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/products">View Deals</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-warning/20 rounded-3xl blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=500&fit=crop"
                alt="Shopping collection"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/50">
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">100% secure checkout</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HeadphonesIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

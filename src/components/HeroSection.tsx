import { ArrowRight, Truck, Shield, HeadphonesIcon, Watch, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full glass glow-border px-4 py-2 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New Year Sale - Up to 60% Off
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground leading-tight">
              Premium Men's
              <span className="text-gradient block">Shoes & Watches</span>
              <span className="block text-muted-foreground text-2xl md:text-3xl mt-2 font-normal">at Unbeatable Prices</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Discover the finest collection of men's footwear and timepieces. 
              Authentic brands, lowest prices, and doorstep delivery across India.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="border-primary/30 hover:bg-primary/10 hover:border-primary">
                <Link to="/auth?type=seller">Become a Seller</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold font-display text-gradient">10K+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-gradient">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-gradient">500+</div>
                <div className="text-sm text-muted-foreground">Brands</div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-3xl animate-glow"></div>
              
              {/* Main product showcase */}
              <div className="relative grid grid-cols-2 gap-4">
                {/* Shoes card */}
                <div className="glass rounded-2xl p-4 glow-border animate-float" style={{ animationDelay: "0s" }}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
                      alt="Premium Sneakers"
                      className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-xs font-medium">SHOES</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Nike Air Max</h3>
                  <p className="text-primary font-bold">₹4,999</p>
                </div>
                
                {/* Watches card */}
                <div className="glass rounded-2xl p-4 glow-border animate-float mt-8" style={{ animationDelay: "0.5s" }}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
                      alt="Premium Watch"
                      className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-accent mb-1">
                    <Watch className="h-4 w-4" />
                    <span className="text-xs font-medium">WATCHES</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Fossil Gen 6</h3>
                  <p className="text-primary font-bold">₹12,999</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16 pt-12 border-t border-border/30">
          <div className="flex items-center gap-4 animate-fade-in glass rounded-xl p-4 glow-border" style={{ animationDelay: "0.3s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange text-primary-foreground shadow-glow">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold font-display text-foreground">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over ₹500</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-fade-in glass rounded-xl p-4 glow-border" style={{ animationDelay: "0.4s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange text-primary-foreground shadow-glow">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold font-display text-foreground">100% Authentic</h3>
              <p className="text-sm text-muted-foreground">Genuine products only</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 animate-fade-in glass rounded-xl p-4 glow-border" style={{ animationDelay: "0.5s" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange text-primary-foreground shadow-glow">
              <HeadphonesIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold font-display text-foreground">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
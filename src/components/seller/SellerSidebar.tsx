import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/seller" },
  { icon: Package, label: "Products", path: "/seller/products" },
  { icon: Plus, label: "Add Product", path: "/seller/products/new" },
  { icon: ShoppingCart, label: "Orders", path: "/seller/orders" },
  { icon: BarChart3, label: "Analytics", path: "/seller/analytics" },
  { icon: Settings, label: "Settings", path: "/seller/settings" },
];

export function SellerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-border/30 bg-card/50 glass transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/30 px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-orange shadow-glow">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold font-display">
                  Wear<span className="text-gradient">Kart</span>
                </span>
                <span className="text-xs text-muted-foreground">Seller Portal</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Shop Info */}
        {!collapsed && profile?.shop_name && (
          <div className="border-b border-border/30 p-4">
            <p className="text-xs text-muted-foreground">Your Shop</p>
            <p className="font-semibold text-foreground truncate">{profile.shop_name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive 
                    ? "bg-gradient-orange text-primary-foreground shadow-glow" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="border-t border-border/30 p-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
              collapsed && "justify-center"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
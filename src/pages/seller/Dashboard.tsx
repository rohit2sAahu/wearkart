import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp, 
  Plus,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerDashboard() {
  const { profile } = useAuth();

  // Placeholder stats - would be fetched from database
  const stats = [
    { title: "Total Products", value: "0", icon: Package, change: "+0%", color: "text-primary" },
    { title: "Total Orders", value: "0", icon: ShoppingCart, change: "+0%", color: "text-success" },
    { title: "Total Revenue", value: "₹0", icon: IndianRupee, change: "+0%", color: "text-warning" },
    { title: "Views Today", value: "0", icon: Eye, change: "+0%", color: "text-accent" },
  ];

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Welcome, {profile?.full_name || 'Seller'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your store today.
            </p>
          </div>
          <Button asChild className="bg-gradient-orange shadow-glow">
            <Link to="/seller/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass glow-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <div className="flex items-center text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="glass glow-border hover:shadow-glow transition-all cursor-pointer group">
            <Link to="/seller/products/new">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange text-primary-foreground shadow-glow group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground">Add New Product</h3>
                  <p className="text-sm text-muted-foreground">List a new shoe or watch</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Link>
          </Card>

          <Card className="glass glow-border hover:shadow-glow transition-all cursor-pointer group">
            <Link to="/seller/products">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground">Manage Products</h3>
                  <p className="text-sm text-muted-foreground">Edit and update listings</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Link>
          </Card>

          <Card className="glass glow-border hover:shadow-glow transition-all cursor-pointer group">
            <Link to="/seller/orders">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold font-display text-foreground">View Orders</h3>
                  <p className="text-sm text-muted-foreground">Process customer orders</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first product to see activity here.
              </p>
              <Button asChild className="bg-gradient-orange">
                <Link to="/seller/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
import { Link, useSearchParams } from "react-router-dom";
import { Package, ChevronRight, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-muted",
};

const Orders = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const [searchParams] = useSearchParams();
  const successOrderNumber = searchParams.get("success");

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-4">Please login to view orders</h2>
              <Button asChild>
                <Link to="/auth">Login / Sign Up</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Orders</h1>
        
        {/* Success Message */}
        {successOrderNumber && (
          <Card className="mb-6 border-success/50 bg-success/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <p className="font-medium text-foreground">Order placed successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your order #{successOrderNumber} has been confirmed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : !orders.length ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">
                When you place orders, they will appear here.
              </p>
              <Button asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">#{order.order_number}</p>
                        <Badge variant="outline" className={statusColors[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₹{order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items?.length || 0} item(s)
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.order_items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="h-16 w-16 rounded-lg overflow-hidden bg-secondary shrink-0"
                          >
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 4 && (
                          <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <span className="text-sm text-muted-foreground">
                              +{order.order_items.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {order.order_items.map((item) => item.product_name).slice(0, 2).join(", ")}
                        {order.order_items.length > 2 && ` and ${order.order_items.length - 2} more`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;

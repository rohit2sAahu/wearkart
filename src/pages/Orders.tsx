import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, ChevronRight, CheckCircle, Clock, XCircle, Truck, ExternalLink, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-muted",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  refunded: <XCircle className="h-4 w-4" />,
};

const statusMessages: Record<string, string> = {
  pending: "Waiting for seller confirmation",
  confirmed: "Order accepted by seller",
  processing: "Order is being prepared",
  shipped: "Order has been shipped",
  delivered: "Order delivered successfully",
  cancelled: "Order was cancelled",
  refunded: "Order has been refunded",
};

const Orders = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const [searchParams] = useSearchParams();
  const successOrderNumber = searchParams.get("success");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order Cancelled",
        description: `Order #${orderNumber} has been cancelled.`,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Could not cancel the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          const newStatus = payload.new.status as string;
          const orderNumber = payload.new.order_number as string;
          
          if (newStatus === 'confirmed') {
            toast({
              title: "Order Accepted! 🎉",
              description: `Your order #${orderNumber} has been confirmed by the seller.`,
            });
          } else if (newStatus === 'cancelled') {
            toast({
              title: "Order Cancelled",
              description: `Your order #${orderNumber} has been cancelled.`,
              variant: "destructive",
            });
          } else if (newStatus === 'shipped') {
            toast({
              title: "Order Shipped! 📦",
              description: `Your order #${orderNumber} is on its way.`,
            });
          } else if (newStatus === 'delivered') {
            toast({
              title: "Order Delivered! ✅",
              description: `Your order #${orderNumber} has been delivered.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

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
                        <Badge variant="outline" className={`${statusColors[order.status]} flex items-center gap-1`}>
                          {statusIcons[order.status]}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {statusMessages[order.status]}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                  
                  {/* Cancel Button for Pending Orders */}
                  {order.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id, order.order_number)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Tracking Information for Shipped Orders */}
                  {order.status === 'shipped' && order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="font-medium text-foreground">{order.tracking_number}</span>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline ml-2"
                          >
                            Track Package
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

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

import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Truck, Home, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/useOrders";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("order");

  const { data: order, isLoading } = useOrder(orderId ?? "");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your order and will begin processing it soon.
            </p>
          </div>

          {/* Order Number */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-foreground">
                  Order #{orderNumber || order?.order_number}
                </span>
              </div>
              
              {order && (
                <>
                  <Separator className="my-4" />
                  
                  {/* Order Summary */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount</span>
                        <span>-₹{order.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {order.shipping_amount === 0 ? "FREE" : `₹${order.shipping_amount.toFixed(2)}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Payment Method */}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>
                      {order.payment_method === "cod" 
                        ? "Cash on Delivery" 
                        : order.payment_method || "Cash on Delivery"}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">We've received your order</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-muted-foreground">Processing</p>
                    <p className="text-sm text-muted-foreground">Your order is being prepared</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-muted-foreground">Shipped</p>
                    <p className="text-sm text-muted-foreground">Your order is on its way</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Home className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-muted-foreground">Delivered</p>
                    <p className="text-sm text-muted-foreground">Enjoy your purchase!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/orders">
                <Package className="h-4 w-4 mr-2" />
                View My Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

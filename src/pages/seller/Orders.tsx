import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function SellerOrders() {
  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders for your products</p>
        </div>

        {/* Empty State */}
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground">
              When customers order your products, they'll appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
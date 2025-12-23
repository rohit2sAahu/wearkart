import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Eye, Package, MapPin, Phone, User } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdmin";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface ShippingAddress {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  confirmed: "bg-success/10 text-success border-success/30",
  processing: "bg-primary/10 text-primary border-primary/30",
  shipped: "bg-primary/10 text-primary border-primary/30",
  delivered: "bg-success/10 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  refunded: "bg-muted text-muted-foreground border-muted",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ orderId: string; action: 'accept' | 'reject' } | null>(null);

  const handleAccept = (orderId: string) => {
    setConfirmAction({ orderId, action: 'accept' });
  };

  const handleReject = (orderId: string) => {
    setConfirmAction({ orderId, action: 'reject' });
  };

  const confirmStatusChange = () => {
    if (!confirmAction) return;
    
    const status = confirmAction.action === 'accept' ? 'confirmed' : 'cancelled';
    updateStatus.mutate({ id: confirmAction.orderId, status });
    setConfirmAction(null);
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate({ id: orderId, status });
  };

  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const activeOrders = orders?.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)) || [];
  const completedOrders = orders?.filter(o => ['delivered', 'cancelled', 'refunded'].includes(o.status)) || [];

  return (
    <AdminLayout title="Orders" description="Accept, reject and manage customer orders">
      {/* Pending Orders - Needs Action */}
      <Card className="mb-6 border-warning/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-warning">
            <Package className="h-5 w-5" />
            New Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
          ) : !pendingOrders.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No new orders to review
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => {
                  const address = order.shipping_address as ShippingAddress | null;
                  return (
                    <TableRow key={order.id} className="bg-warning/5">
                      <TableCell className="font-medium text-foreground">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {address?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.order_items?.length || 0} items
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleAccept(order.id)}
                            disabled={updateStatus.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(order.id)}
                            disabled={updateStatus.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Active Orders ({activeOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!activeOrders.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No active orders
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrders.map((order) => {
                  const address = order.shipping_address as ShippingAddress | null;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-foreground">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {address?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.order_items?.length || 0} items
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'processing')}
                            >
                              Start Processing
                            </Button>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'shipped')}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5" />
            Completed/Cancelled ({completedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!completedOrders.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No completed orders yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedOrders.slice(0, 10).map((order) => {
                  const address = order.shipping_address as ShippingAddress | null;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-foreground">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {address?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={statusColors[selectedOrder.status]}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedOrder.created_at), "PPp")}
                </span>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const addr = selectedOrder.shipping_address as ShippingAddress | null;
                    return addr ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{addr.full_name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {addr.phone}
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <div>
                            <p>{addr.address_line1}</p>
                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                            <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                            <p>{addr.country}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No address provided</p>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-secondary overflow-hidden shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">₹{item.total_price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₹{(selectedOrder.shipping_amount || 0).toLocaleString()}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-₹{selectedOrder.discount_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions for pending orders */}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => {
                      handleAccept(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept Order
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleReject(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'accept' ? 'Accept Order?' : 'Reject Order?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'accept'
                ? 'This will confirm the order and notify the customer that their order has been accepted.'
                : 'This will cancel the order and notify the customer that their order has been rejected.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={confirmAction?.action === 'accept' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
            >
              {confirmAction?.action === 'accept' ? 'Accept' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

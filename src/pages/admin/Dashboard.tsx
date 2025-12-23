import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminProducts, useAdminOrders, useAdminCategories } from "@/hooks/useAdmin";
import { Package, ShoppingCart, DollarSign, TrendingUp, Tags } from "lucide-react";

export default function AdminDashboard() {
  const { data: products } = useAdminProducts();
  const { data: orders } = useAdminOrders();
  const { data: categories } = useAdminCategories();

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const activeProducts = products?.filter(p => p.is_active).length || 0;

  const stats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: Package,
      description: `${activeProducts} active`,
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: ShoppingCart,
      description: `${pendingOrders} pending`,
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All time",
    },
    {
      title: "Categories",
      value: categories?.length || 0,
      icon: Tags,
      description: "Active categories",
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <AdminLayout title="Dashboard" description="Overview of your store">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">₹{order.total_amount}</p>
                    <p className={`text-sm capitalize ${
                      order.status === 'delivered' ? 'text-success' :
                      order.status === 'cancelled' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

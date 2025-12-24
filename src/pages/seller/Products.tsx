import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Package, Edit, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SellerProducts() {
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (id, image_url, is_primary),
          categories (name)
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">My Products</h1>
            <p className="text-muted-foreground">Manage your product listings</p>
          </div>
          <Button asChild className="bg-gradient-orange shadow-glow">
            <Link to="/seller/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </Button>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url
                || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400';

              return (
                <Card key={product.id} className="glass glow-border overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden bg-secondary/30">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {product.is_featured && (
                        <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      {!product.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.categories?.name || 'Uncategorized'}
                        </p>
                        <p className="text-lg font-bold text-gradient mt-1">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock_quantity}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/product/${product.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start selling by adding your first product.
              </p>
              <Button asChild className="bg-gradient-orange">
                <Link to="/seller/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </SellerLayout>
  );
}
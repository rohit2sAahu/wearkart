import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "./useCart";

export interface OrderData {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_id: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_code: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  tracking_number: string | null;
  tracking_url: string | null;
  supplier_order_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export function useOrders() {
  const { user } = useAuth();

  const ordersQuery = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as OrderData[];
    },
    enabled: !!user,
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
  };
}

export function useOrder(orderId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as OrderData | null;
    },
    enabled: !!user && !!orderId,
  });
}

export function useCreateOrder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { items: cartItems, clearCart } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shippingAddress,
      paymentMethod,
      couponCode,
    }: {
      shippingAddress: ShippingAddress;
      paymentMethod: string;
      couponCode?: string;
    }) => {
      if (!user) throw new Error('Please login to place order');
      if (cartItems.length === 0) throw new Error('Cart is empty');

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product_variants?.price ?? item.products?.price ?? 0;
        return sum + (price * item.quantity);
      }, 0);
      
      const shippingAmount = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
      const totalAmount = subtotal + shippingAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create order
      const orderInsert = {
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        payment_method: paymentMethod,
        subtotal,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        coupon_code: couponCode,
        shipping_address: JSON.parse(JSON.stringify(shippingAddress)),
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.products?.name ?? 'Unknown Product',
        product_image: null,
        variant_name: item.product_variants?.name ?? null,
        quantity: item.quantity,
        unit_price: item.product_variants?.price ?? item.products?.price ?? 0,
        total_price: (item.product_variants?.price ?? item.products?.price ?? 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order as unknown as OrderData;
    },
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order placed!",
        description: `Your order ${order.order_number} has been placed successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

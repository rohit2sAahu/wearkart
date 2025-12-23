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
  const { clearCart } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes,
    }: {
      shippingAddress: ShippingAddress;
      billingAddress?: ShippingAddress;
      paymentMethod?: string;
      couponCode?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Please login to place order');

      // Use secure server-side function to create order with validated prices
      const { data, error } = await supabase.rpc('create_validated_order', {
        p_shipping_address: JSON.parse(JSON.stringify(shippingAddress)),
        p_billing_address: billingAddress ? JSON.parse(JSON.stringify(billingAddress)) : null,
        p_payment_method: paymentMethod || null,
        p_coupon_code: couponCode || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      
      // The function returns order details as JSONB
      const orderResult = data as {
        order_id: string;
        order_number: string;
        subtotal: number;
        shipping_amount: number;
        tax_amount: number;
        discount_amount: number;
        total_amount: number;
      };

      return {
        id: orderResult.order_id,
        order_number: orderResult.order_number,
        subtotal: orderResult.subtotal,
        shipping_amount: orderResult.shipping_amount,
        tax_amount: orderResult.tax_amount,
        discount_amount: orderResult.discount_amount,
        total_amount: orderResult.total_amount,
      } as unknown as OrderData;
    },
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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

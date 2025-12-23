import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartItemWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    slug: string;
  } | null;
  product_variants: {
    id: string;
    name: string;
    price: number | null;
  } | null;
}

export function useCart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          variant_id,
          quantity,
          created_at,
          updated_at,
          products(id, name, price, compare_at_price, slug),
          product_variants(id, name, price)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as unknown as CartItemWithProduct[];
    },
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, variantId, quantity = 1 }: { 
      productId: string; 
      variantId?: string; 
      quantity?: number 
    }) => {
      if (!user) throw new Error('Please login to add items to cart');

      // Check if item already exists
      let query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId ?? null,
            quantity,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
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

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Removed",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const items = cartQuery.data ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product_variants?.price ?? item.products?.price ?? 0;
    return sum + (price * item.quantity);
  }, 0);

  return {
    items,
    isLoading: cartQuery.isLoading,
    totalItems,
    totalPrice,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    isAddingToCart: addToCart.isPending,
  };
}

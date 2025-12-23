import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WishlistItemWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    brand: string | null;
  } | null;
}

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          products(id, name, slug, price, compare_at_price, brand)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as unknown as WishlistItemWithProduct[];
    },
    enabled: !!user,
  });

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Please login to add items to wishlist');

      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist.",
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

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: "Removed",
        description: "Item has been removed from your wishlist.",
      });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistQuery.data?.some(item => item.product_id === productId) ?? false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  return {
    items: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
    isInWishlist,
    toggleWishlist,
  };
}

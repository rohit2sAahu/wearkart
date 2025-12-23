import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, Category } from "@/types/database";

export function useProducts(filters?: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(*),
          product_images(*),
          product_variants(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .maybeSingle();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters?.brand) {
        query = query.eq('brand', filters.brand);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*),
          product_images(*),
          product_variants(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*),
          product_images(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .eq('is_active', true)
        .not('brand', 'is', null);

      if (error) throw error;
      
      const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))];
      return uniqueBrands as string[];
    },
  });
}

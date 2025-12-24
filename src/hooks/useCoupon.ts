import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CouponData {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number | null;
}

interface CouponValidation {
  isValid: boolean;
  coupon: CouponData | null;
  discount: number;
  errorMessage: string | null;
}

export function useCoupon(code: string, orderSubtotal: number) {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const couponQuery = useQuery({
    queryKey: ['coupon', appliedCode, orderSubtotal],
    queryFn: async (): Promise<CouponValidation> => {
      if (!appliedCode) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: null };
      }

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', appliedCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: 'Error validating coupon' };
      }

      if (!data) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: 'Invalid coupon code' };
      }

      const coupon = data as CouponData;
      const now = new Date();

      // Check if coupon has started
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: 'This coupon is not yet active' };
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: 'This coupon has expired' };
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderSubtotal < coupon.min_order_amount) {
        return { 
          isValid: false, 
          coupon: null, 
          discount: 0, 
          errorMessage: `Minimum order of ₹${coupon.min_order_amount} required` 
        };
      }

      // Check usage limit
      if (coupon.usage_limit && (coupon.used_count ?? 0) >= coupon.usage_limit) {
        return { isValid: false, coupon: null, discount: 0, errorMessage: 'Coupon usage limit reached' };
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = orderSubtotal * (coupon.discount_value / 100);
        if (coupon.max_discount_amount) {
          discount = Math.min(discount, coupon.max_discount_amount);
        }
      } else if (coupon.discount_type === 'fixed') {
        discount = Math.min(coupon.discount_value, orderSubtotal);
      }

      return { isValid: true, coupon, discount, errorMessage: null };
    },
    enabled: !!appliedCode,
  });

  const applyCoupon = () => {
    setAppliedCode(code);
  };

  const removeCoupon = () => {
    setAppliedCode(null);
  };

  return {
    validation: couponQuery.data ?? { isValid: false, coupon: null, discount: 0, errorMessage: null },
    isValidating: couponQuery.isLoading,
    applyCoupon,
    removeCoupon,
    appliedCode,
  };
}

-- Create a secure function to validate and create orders server-side
CREATE OR REPLACE FUNCTION public.create_validated_order(
  p_shipping_address JSONB,
  p_billing_address JSONB DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_coupon_code TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC := 0;
  v_shipping_amount NUMERIC;
  v_tax_amount NUMERIC;
  v_discount_amount NUMERIC := 0;
  v_total_amount NUMERIC;
  v_cart_item RECORD;
  v_product_price NUMERIC;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create an order';
  END IF;

  -- Check if cart has items
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Calculate subtotal from actual product prices in database
  FOR v_cart_item IN 
    SELECT 
      ci.id as cart_item_id,
      ci.product_id,
      ci.variant_id,
      ci.quantity,
      p.name as product_name,
      p.price as product_price,
      pv.price as variant_price,
      pv.name as variant_name,
      (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.user_id = v_user_id
  LOOP
    -- Use variant price if exists, otherwise product price
    v_product_price := COALESCE(v_cart_item.variant_price, v_cart_item.product_price);
    v_subtotal := v_subtotal + (v_product_price * v_cart_item.quantity);
  END LOOP;

  -- Apply server-side shipping logic
  v_shipping_amount := CASE WHEN v_subtotal > 500 THEN 0 ELSE 50 END;
  
  -- Calculate tax (example: 0% - adjust as needed)
  v_tax_amount := 0;

  -- Validate and apply coupon if provided
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    SELECT 
      CASE 
        WHEN c.discount_type = 'percentage' THEN 
          LEAST(v_subtotal * (c.discount_value / 100), COALESCE(c.max_discount_amount, v_subtotal))
        WHEN c.discount_type = 'fixed' THEN 
          LEAST(c.discount_value, v_subtotal)
        ELSE 0
      END
    INTO v_discount_amount
    FROM coupons c
    WHERE c.code = p_coupon_code
      AND c.is_active = true
      AND (c.starts_at IS NULL OR c.starts_at <= NOW())
      AND (c.expires_at IS NULL OR c.expires_at > NOW())
      AND (c.min_order_amount IS NULL OR v_subtotal >= c.min_order_amount)
      AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit);
    
    v_discount_amount := COALESCE(v_discount_amount, 0);
    
    -- Update coupon usage count if discount was applied
    IF v_discount_amount > 0 THEN
      UPDATE coupons SET used_count = COALESCE(used_count, 0) + 1 WHERE code = p_coupon_code;
    END IF;
  END IF;

  -- Calculate total
  v_total_amount := v_subtotal + v_shipping_amount + v_tax_amount - v_discount_amount;

  -- Generate order number
  v_order_number := generate_order_number();

  -- Create the order
  INSERT INTO orders (
    user_id,
    order_number,
    subtotal,
    shipping_amount,
    tax_amount,
    discount_amount,
    total_amount,
    shipping_address,
    billing_address,
    payment_method,
    coupon_code,
    notes,
    status,
    payment_status
  ) VALUES (
    v_user_id,
    v_order_number,
    v_subtotal,
    v_shipping_amount,
    v_tax_amount,
    v_discount_amount,
    v_total_amount,
    p_shipping_address,
    COALESCE(p_billing_address, p_shipping_address),
    p_payment_method,
    CASE WHEN v_discount_amount > 0 THEN p_coupon_code ELSE NULL END,
    p_notes,
    'pending',
    'pending'
  )
  RETURNING id INTO v_order_id;

  -- Create order items from cart with validated prices
  INSERT INTO order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_name,
    product_image,
    quantity,
    unit_price,
    total_price
  )
  SELECT 
    v_order_id,
    ci.product_id,
    ci.variant_id,
    p.name,
    pv.name,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1),
    ci.quantity,
    COALESCE(pv.price, p.price),
    COALESCE(pv.price, p.price) * ci.quantity
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  LEFT JOIN product_variants pv ON pv.id = ci.variant_id
  WHERE ci.user_id = v_user_id;

  -- Clear the cart
  DELETE FROM cart_items WHERE user_id = v_user_id;

  -- Return order details
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_amount', v_shipping_amount,
    'tax_amount', v_tax_amount,
    'discount_amount', v_discount_amount,
    'total_amount', v_total_amount
  );
END;
$$;
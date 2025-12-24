-- Add seller-specific columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_name text,
ADD COLUMN IF NOT EXISTS shop_description text,
ADD COLUMN IF NOT EXISTS gst_number text,
ADD COLUMN IF NOT EXISTS is_verified_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS seller_rating numeric DEFAULT 0;

-- Add seller_id to products table (which seller uploaded this product)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id);

-- Create index for seller products lookup
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- Create a function to check if user is a seller
CREATE OR REPLACE FUNCTION public.is_seller()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'seller')
$$;

-- Allow sellers to insert products
CREATE POLICY "Sellers can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (public.is_seller() AND auth.uid() = seller_id);

-- Allow sellers to update their own products  
CREATE POLICY "Sellers can update own products" 
ON public.products 
FOR UPDATE 
USING (public.is_seller() AND auth.uid() = seller_id);

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete own products" 
ON public.products 
FOR DELETE 
USING (public.is_seller() AND auth.uid() = seller_id);

-- Allow sellers to insert their product images
CREATE POLICY "Sellers can insert product images" 
ON public.product_images 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to update their product images
CREATE POLICY "Sellers can update own product images" 
ON public.product_images 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to delete their product images
CREATE POLICY "Sellers can delete own product images" 
ON public.product_images 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to insert their product variants
CREATE POLICY "Sellers can insert product variants" 
ON public.product_variants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_variants.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to update their product variants
CREATE POLICY "Sellers can update own product variants" 
ON public.product_variants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_variants.product_id 
    AND products.seller_id = auth.uid()
  )
);

-- Allow sellers to delete their product variants
CREATE POLICY "Sellers can delete own product variants" 
ON public.product_variants 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_variants.product_id 
    AND products.seller_id = auth.uid()
  )
);
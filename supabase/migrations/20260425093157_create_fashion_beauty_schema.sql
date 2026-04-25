/*
  # Fashion & Beauty Ecommerce Schema

  ## Overview
  Complete schema for a fashion and beauty ecommerce platform.

  ## New Tables

  ### 1. profiles
  - Extends Supabase auth.users
  - Stores full_name, avatar_url, phone, role (user/admin)

  ### 2. categories
  - Product categories (Beauty, Skincare, Fashion, Accessories, etc.)
  - Fields: name, slug, description, image_url, display_order

  ### 3. products
  - Core product catalog
  - Fields: name, description, price, original_price, category_id, brand, images (array), rating, review_count, stock, is_featured, is_new_arrival, is_best_seller

  ### 4. reviews
  - Product reviews by authenticated users
  - Fields: product_id, user_id, rating, comment

  ### 5. wishlist
  - User wishlist items
  - Fields: user_id, product_id

  ### 6. orders
  - Order records after successful payment
  - Fields: user_id, status, subtotal, shipping, total, shipping_address (jsonb), payment_intent_id

  ### 7. order_items
  - Individual line items for each order
  - Fields: order_id, product_id, quantity, price_at_purchase, product_snapshot (jsonb)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Admins can manage products, categories, and orders
  - Public read access for products, categories, and reviews
*/

-- ─────────────────────────────────────────
-- CLEAN RESET (only profiles)
-- ─────────────────────────────────────────

DROP TABLE IF EXISTS public.profiles CASCADE;

-- ─────────────────────────────────────────
-- PROFILES TABLE
-- ─────────────────────────────────────────

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  phone text DEFAULT '',
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- ENABLE RLS
-- ─────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (manual insert)
CREATE POLICY "insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 🔥 CRITICAL: allow backend/trigger inserts
CREATE POLICY "service role insert"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- ─────────────────────────────────────────
-- TRIGGER FUNCTION
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 🔥 IMPORTANT: bypass RLS
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ─────────────────────────────────────────
-- TRIGGER
-- ─────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2) DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand text DEFAULT '',
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON products(is_featured);
CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON products(is_best_seller);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);

-- ─────────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb DEFAULT '{}',
  payment_intent_id text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);

-- ─────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_purchase numeric(10,2) NOT NULL DEFAULT 0,
  product_snapshot jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);

-- ─────────────────────────────────────────
-- SEED: CATEGORIES
-- ─────────────────────────────────────────
INSERT INTO categories (name, slug, description, image_url, display_order) VALUES
  ('Skincare', 'skincare', 'Nourish and protect your skin with premium formulas', 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg', 1),
  ('Makeup', 'makeup', 'Express yourself with our curated makeup collection', 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg', 2),
  ('Haircare', 'haircare', 'Salon-quality hair care for every type', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', 3),
  ('Fashion', 'fashion', 'Elevate your wardrobe with on-trend pieces', 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg', 4),
  ('Accessories', 'accessories', 'The finishing touches that complete any look', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 5),
  ('Fragrance', 'fragrance', 'Signature scents for every mood and moment', 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- SEED: PRODUCTS
-- ─────────────────────────────────────────
DO $$
DECLARE
  cat_skincare uuid;
  cat_makeup uuid;
  cat_haircare uuid;
  cat_fashion uuid;
  cat_accessories uuid;
  cat_fragrance uuid;
BEGIN
  SELECT id INTO cat_skincare FROM categories WHERE slug = 'skincare';
  SELECT id INTO cat_makeup FROM categories WHERE slug = 'makeup';
  SELECT id INTO cat_haircare FROM categories WHERE slug = 'haircare';
  SELECT id INTO cat_fashion FROM categories WHERE slug = 'fashion';
  SELECT id INTO cat_accessories FROM categories WHERE slug = 'accessories';
  SELECT id INTO cat_fragrance FROM categories WHERE slug = 'fragrance';

  INSERT INTO products (name, description, price, original_price, category_id, brand, images, rating, review_count, stock, is_featured, is_new_arrival, is_best_seller) VALUES
  -- Skincare
  ('Radiance Glow Serum', 'A lightweight vitamin C serum that brightens, evens skin tone, and protects against free radicals. Dermatologist tested.', 68.00, 89.00, cat_skincare, 'LumiSkin', ARRAY['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg','https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg'], 4.8, 342, 50, true, false, true),
  ('Hydra-Boost Moisturizer', 'Deep hydration cream with hyaluronic acid and ceramides. 72-hour moisture lock technology.', 45.00, 60.00, cat_skincare, 'AquaDerm', ARRAY['https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg','https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'], 4.6, 218, 80, true, false, false),
  ('Retinol Night Repair', 'Advanced anti-aging night cream with 0.3% encapsulated retinol for visible wrinkle reduction.', 95.00, 120.00, cat_skincare, 'LumiSkin', ARRAY['https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg'], 4.9, 156, 30, false, true, true),
  ('SPF 50 Mineral Sunscreen', 'Invisible mineral SPF 50 that doubles as a primer. No white cast, reef-safe formula.', 38.00, 0, cat_skincare, 'SunShield', ARRAY['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'], 4.5, 89, 120, false, true, false),
  ('Rose Quartz Face Roller', 'Genuine rose quartz facial roller to reduce puffiness, boost circulation and enhance serum absorption.', 28.00, 35.00, cat_skincare, 'GlowTool', ARRAY['https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg'], 4.7, 201, 75, false, false, true),
  ('Niacinamide Pore Minimizer', '10% niacinamide + 1% zinc formula to minimize pores and control oil production.', 32.00, 0, cat_skincare, 'ClearGlow', ARRAY['https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg'], 4.4, 445, 200, true, false, true),

  -- Makeup
  ('Velvet Matte Lipstick', 'Long-wearing liquid lipstick in 24 stunning shades. 16-hour wear, transfer-proof formula.', 24.00, 30.00, cat_makeup, 'ColorLux', ARRAY['https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg','https://images.pexels.com/photos/1749452/pexels-photo-1749452.jpeg'], 4.7, 512, 150, true, false, true),
  ('Sculpt & Glow Foundation', 'Buildable coverage foundation with SPF 20. Skin-like finish that lasts all day.', 52.00, 65.00, cat_makeup, 'ColorLux', ARRAY['https://images.pexels.com/photos/1749452/pexels-photo-1749452.jpeg'], 4.5, 287, 60, true, false, false),
  ('Faux Mink Lash Set', '5-pair set of premium faux mink lashes. Reusable up to 25 wears.', 18.00, 25.00, cat_makeup, 'LashQueen', ARRAY['https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg'], 4.8, 634, 200, false, true, true),
  ('Brow Definer Pencil', 'Micro-precision brow pencil with spoolie. Waterproof, 48-hour wear.', 22.00, 0, cat_makeup, 'ArchPerfect', ARRAY['https://images.pexels.com/photos/1749452/pexels-photo-1749452.jpeg'], 4.6, 189, 300, false, false, false),
  ('Highlighter Palette', 'Four luminous shades from champagne to deep bronze. Pressed and liquid options.', 42.00, 55.00, cat_makeup, 'GlowUp', ARRAY['https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg'], 4.9, 356, 45, true, true, true),
  ('Setting Spray', 'Locking mist that extends makeup wear for 24 hours. Oil-controlling formula.', 19.00, 24.00, cat_makeup, 'ColorLux', ARRAY['https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg'], 4.4, 278, 180, false, false, true),

  -- Haircare
  ('Argan Oil Repair Mask', 'Intensive repair treatment with pure argan oil. Restores strength, shine and elasticity in 5 minutes.', 38.00, 50.00, cat_haircare, 'HairLux', ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'], 4.7, 234, 90, false, true, false),
  ('Volume Boost Shampoo', 'Sulfate-free formula that lifts roots and adds fullness without weighing hair down.', 28.00, 0, cat_haircare, 'PureStrand', ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'], 4.5, 167, 110, false, false, true),
  ('Heat Protectant Spray', '450°F thermal protection spray with silk proteins. Non-greasy, weightless formula.', 22.00, 28.00, cat_haircare, 'HairLux', ARRAY['https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'], 4.6, 312, 150, false, false, false),

  -- Fashion
  ('Silk Satin Midi Dress', 'Effortlessly elegant midi dress in silk-touch satin. Perfect for day-to-evening transitions.', 125.00, 160.00, cat_fashion, 'Elara', ARRAY['https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg','https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'], 4.8, 89, 35, true, true, false),
  ('Tailored Blazer', 'Sharp, structured blazer in premium wool-blend. Versatile piece that transitions from boardroom to brunch.', 185.00, 230.00, cat_fashion, 'Elara', ARRAY['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'], 4.7, 134, 28, true, false, true),
  ('High-Waist Trousers', 'Wide-leg, high-waist trousers in crepe fabric. Flattering silhouette for all body types.', 95.00, 120.00, cat_fashion, 'ModernMuse', ARRAY['https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg'], 4.6, 201, 50, false, true, false),
  ('Linen Wrap Blouse', 'Breezy linen wrap blouse with adjustable tie. Naturally breathable and sustainably sourced.', 75.00, 95.00, cat_fashion, 'ModernMuse', ARRAY['https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'], 4.5, 156, 65, false, false, true),

  -- Accessories
  ('Gold Link Chain Necklace', 'Minimalist 18k gold-plated chain necklace. Tarnish-resistant, hypoallergenic.', 48.00, 65.00, cat_accessories, 'AuraBijoux', ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'], 4.8, 412, 100, true, false, true),
  ('Tortoise Shell Sunglasses', 'UV400 polarized lenses in signature tortoise acetate frames. Timeless and protective.', 85.00, 110.00, cat_accessories, 'VisionLux', ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'], 4.7, 267, 45, true, true, false),
  ('Leather Mini Bag', 'Structured mini crossbody in genuine leather with gold hardware. Fits phone, cards, and essentials.', 145.00, 185.00, cat_accessories, 'MaisonB', ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'], 4.9, 178, 20, true, false, true),

  -- Fragrance
  ('Bloom Eau de Parfum', 'A floral-oriental masterpiece with notes of rose, jasmine, and warm amber. 50ml.', 128.00, 160.00, cat_fragrance, 'Atelier Fleur', ARRAY['https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'], 4.9, 534, 40, true, false, true),
  ('Cedar & Musk EDT', 'Fresh woody fragrance for any gender. Opens with bergamot, dries to cedar and white musk. 75ml.', 95.00, 0, cat_fragrance, 'Maison Noir', ARRAY['https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'], 4.7, 289, 60, false, true, false),
  ('Discovery Fragrance Set', 'Six 10ml travel vials of our best-selling scents. Perfect for finding your signature.', 75.00, 95.00, cat_fragrance, 'Various', ARRAY['https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'], 4.8, 341, 80, true, true, true)
ON CONFLICT DO NOTHING;
END $$;

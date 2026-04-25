-- =============================================================
-- Bionic Life App — Initial Schema
-- =============================================================

-- -----------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  -- Role is ALSO stored in app_metadata for RLS; this column is for display only
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: users can view own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: users can update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles: admins can view all" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------------
-- 2. PRODUCTS
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category    TEXT,           -- e.g. 'Rice', 'Snacks', 'Oil'
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active products
CREATE POLICY "products: public read" ON public.products
  FOR SELECT USING (is_active = TRUE);

-- Only admins can insert / update / delete
CREATE POLICY "products: admin write" ON public.products
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------
-- 3. BATCHES (Traceability)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.batches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES public.products(id) ON DELETE CASCADE,
  harvest_date  DATE,
  location      TEXT,
  farm_name     TEXT,
  is_organic    BOOLEAN NOT NULL DEFAULT TRUE,
  notes         TEXT,
  qr_data       TEXT,         -- the URL encoded in QR, e.g. /trace/{id}
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Public (and mobile app anon) can read batches for traceability
CREATE POLICY "batches: public read" ON public.batches
  FOR SELECT USING (TRUE);

CREATE POLICY "batches: admin write" ON public.batches
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );


-- -----------------------------------------------------------------
-- 4. ORDERS
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'cancelled', 'shipped', 'delivered')),
  total_amount        NUMERIC(12, 2) NOT NULL,
  shipping_fee        NUMERIC(12, 2) NOT NULL DEFAULT 15000,
  midtrans_token      TEXT,
  midtrans_order_id   TEXT UNIQUE,
  shipping_address    TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: users read own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders: users create own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders: admin all" ON public.orders
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------------
-- 5. ORDER ITEMS
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id),
  quantity    INT NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items: users read own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items: users insert own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items: admin all" ON public.order_items
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );


-- -----------------------------------------------------------------
-- 6. SEED: Sample products
-- -----------------------------------------------------------------
INSERT INTO public.products (name, description, price, stock, category, is_active) VALUES
  ('Beras Organik Premium', 'Beras putih organik pilihan dari petani lokal Subang, bebas pestisida.', 85000, 150, 'Rice', TRUE),
  ('Beras Merah Organik', 'Beras merah organik kaya serat, cocok untuk diet sehat.', 95000, 80, 'Rice', TRUE),
  ('Keripik Singkong Organik', 'Camilan renyah dari singkong organik tanpa MSG.', 25000, 200, 'Snacks', TRUE),
  ('Minyak Kelapa Virgin', 'Cold-pressed virgin coconut oil murni tanpa bahan tambahan.', 65000, 60, 'Oil', TRUE),
  ('Gula Aren Organik', 'Gula aren asli dari pohon aren tanpa campuran gula pasir.', 35000, 120, 'Sweeteners', TRUE)
ON CONFLICT DO NOTHING;

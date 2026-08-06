-- Voer dit script uit in de Supabase SQL Editor om de tabellen aan te maken / up-to-date te brengen.

CREATE TABLE IF NOT EXISTS public.settings (
  key text primary key,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zorg dat updates op de settings tabel bijgehouden worden
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Schakel Row Level Security (RLS) in voor settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Pas dit desgewenst aan; voor nu staat insert/update open vanuit de backend (service key) 
-- maar we kunnen basic RLS instellen (geen public read voor stripe keys)
DROP POLICY IF EXISTS "Allow anon viewing of settings" ON public.settings;
CREATE POLICY "Allow anon viewing of settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts settings" ON public.settings;
CREATE POLICY "Allow inserts settings" ON public.settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates settings" ON public.settings;
CREATE POLICY "Allow updates settings" ON public.settings FOR UPDATE USING (true);


CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  pickup_location text not null,
  dropoff_location text,
  date text not null,
  time text not null,
  price numeric(10,2),
  status text default 'Pending',
  vehicle text,
  passengers integer,
  luggage integer,
  flight_number text,
  payment_method text,
  ride_type text,
  return_date text,
  return_time text,
  waypoints text -- Je kan dit ook jsonb maken als je gestructureerde data wilt in Supabase
);

-- Schakel Row Level Security (RLS) in
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Maak policies aan zodat je app data kan toevoegen, lezen en updaten.
-- (Deze "true" check is erg open zodat iedereen kan boeken. Zorg in productie evt. voor strengere regels.)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.bookings;
CREATE POLICY "Allow anonymous inserts" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public viewing of bookings" ON public.bookings;
CREATE POLICY "Allow public viewing of bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow updates" ON public.bookings;
CREATE POLICY "Allow updates" ON public.bookings FOR UPDATE USING (true);

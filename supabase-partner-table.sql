-- Plaats deze code in de SQL editor van Supabase om de partner table aan te maken

CREATE TABLE partner_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  total_rides integer DEFAULT 0,
  status text DEFAULT 'Pending',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE partner_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on partner_registrations" ON partner_registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select on partner_registrations" ON partner_registrations FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on partner_registrations" ON partner_registrations FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on partner_registrations" ON partner_registrations FOR DELETE TO public USING (true);

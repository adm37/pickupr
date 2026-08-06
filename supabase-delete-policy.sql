-- SQL om de delete policy toe te voegen voor de bookings tabel
-- Kopieer en plak dit in de Supabase SQL Editor en klik op "Run"

-- Stap 1: Zorg ervoor dat Row Level Security (RLS) is ingeschakeld 
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Stap 2: Voeg een beleid toe dat het verwijderen van boekingen toestaat
-- (Opmerking: in een productieomgeving wil je dit mogelijk beperken tot alleen admin gebruikers)
CREATE POLICY "Allow deletes on bookings"
ON bookings FOR DELETE
TO public
USING (true);

-- Controleer indien nodig ook de andere policies, bijvoorbeeld voor select/insert:
-- CREATE POLICY "Allow public select" ON bookings FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON bookings FOR UPDATE USING (true);

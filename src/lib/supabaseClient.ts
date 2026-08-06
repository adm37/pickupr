/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access Supabase environment variables from Vite, with fallbacks to the provided project details
const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL || 'https://hmjkfbfjdjcqbtivtujz.supabase.co';
const supabaseUrl = supabaseUrlRaw.replace('.supabase.com', '.supabase.co');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtamtmYmZqZGpjcWJ0aXZ0dWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDI0OTcsImV4cCI6MjA5NzAxODQ5N30.gq8glEdabwb1N8_pJNfh_GX25BP3woZNT8hUhslDcn4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


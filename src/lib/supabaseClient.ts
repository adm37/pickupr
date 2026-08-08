/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

function normalizeEnv(value: unknown): string {
	return String(value ?? '')
		.trim()
		.replace(/^['\"]|['\"]$/g, '')
		.trim();
}

const supabaseUrlRaw = normalizeEnv(import.meta.env.VITE_SUPABASE_URL || '');
export const supabaseUrl = supabaseUrlRaw.replace('.supabase.com', '.supabase.co');
export const supabaseAnonKey = normalizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: any = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;


export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function normalizeEnv(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^['\"]|['\"]$/g, '')
    .trim();
}

function getSupabaseUrlCandidates(urlValue: string): string[] {
  const normalized = normalizeEnv(urlValue);
  if (!normalized) return [];

  const urls = new Set<string>([normalized]);
  if (normalized.includes('.supabase.com')) {
    urls.add(normalized.replace('.supabase.com', '.supabase.co'));
  }
  if (normalized.includes('.supabase.co')) {
    urls.add(normalized.replace('.supabase.co', '.supabase.com'));
  }

  return Array.from(urls);
}

function getSupabaseClients() {
  const supabaseUrlRaw =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';

  const supabaseKey = normalizeEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '',
  );

  if (!supabaseKey) {
    return [];
  }

  return getSupabaseUrlCandidates(supabaseUrlRaw).map((url) => createClient(url, supabaseKey));
}

async function runWithSupabaseRetry<T>(
  operation: (client: ReturnType<typeof createClient>) => Promise<T>,
): Promise<T> {
  const clients = getSupabaseClients();
  if (clients.length === 0) {
    throw new Error('Supabase configuration missing');
  }

  let lastError: any = null;
  for (const client of clients) {
    try {
      return await operation(client);
    } catch (error: any) {
      lastError = error;
    }
  }

  throw lastError || new Error('Supabase request failed');
}

export const GET: APIRoute = async () => {
  if (getSupabaseClients().length === 0) {
    return new Response(JSON.stringify({ bookings: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await runWithSupabaseRetry((client) =>
      client.from('bookings').select('*').order('created_at', { ascending: false }),
    );
    if (error) throw error;

    return new Response(JSON.stringify({ bookings: data ?? [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch bookings';
    return new Response(JSON.stringify({ error: { message } }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (getSupabaseClients().length === 0) {
    return new Response(JSON.stringify({ error: { message: 'Database is not configured' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { data, error } = await runWithSupabaseRetry((client) =>
      client.from('bookings').insert([body]).select(),
    );

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking: data?.[0] || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: { message: error?.message || 'Failed to create booking' } }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

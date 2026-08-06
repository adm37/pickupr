export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = supabaseUrlRaw.replace('.supabase.com', '.supabase.co');
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function normalizeProfileId(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^['\"]|['\"]$/g, '')
    .trim();
}

function isValidProfileId(value: string): boolean {
  return /^pfl_[A-Za-z0-9_]+$/.test(value);
}

export const GET: APIRoute = async () => {
  try {
    let profileId = normalizeProfileId(process.env.MOLLIE_PROFILE_ID || '');

    if (!profileId && supabase) {
      try {
        const { data } = await supabase.from('settings').select('value').eq('key', 'MOLLIE_PROFILE_ID').single();
        if (data?.value) {
          profileId = normalizeProfileId(data.value);
        }
      } catch (error) {
        console.error('Failed to load Mollie profile ID from Supabase', error);
      }
    }

    if (!profileId) {
      return new Response(
        JSON.stringify({ error: 'MOLLIE_PROFILE_ID is missing in environment variables or settings.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!isValidProfileId(profileId)) {
      return new Response(
        JSON.stringify({
          error:
            `MOLLIE_PROFILE_ID is invalid. It must start with \"pfl_\". Received: \"${profileId}\". ` +
            'Check for extra quotes or spaces in your Hostinger environment variable.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const apiKey = process.env.MOLLIE_API_KEY || '';
    return new Response(
      JSON.stringify({
        profileId,
        testmode: apiKey.startsWith('test_'),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed to load Mollie config.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

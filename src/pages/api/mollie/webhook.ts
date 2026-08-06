export const prerender = false;

import type { APIRoute } from 'astro';
import { Client as MollieClientType } from 'mollie-api-typescript';
import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = supabaseUrlRaw.replace('.supabase.com', '.supabase.co');
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getMollieClient(): MollieClientType | null {
  const apiKey = String(process.env.MOLLIE_API_KEY || '').trim();
  if (!apiKey) return null;
  return new MollieClientType({ security: { apiKey } });
}

function parseWebhookPaymentId(rawBody: string) {
  const body = rawBody.trim();
  if (!body) return '';

  // Mollie usually posts application/x-www-form-urlencoded with "id=tr_xxx".
  const params = new URLSearchParams(body);
  return params.get('id') || body;
}

function mapPaymentUpdate(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'paid' || normalized === 'authorized') {
    return { payment_status: 'paid', status: 'Confirmed' };
  }

  if (normalized === 'canceled') {
    return { payment_status: 'canceled', status: 'Cancelled' };
  }

  if (normalized === 'failed') {
    return { payment_status: 'failed', status: 'Cancelled' };
  }

  if (normalized === 'expired') {
    return { payment_status: 'expired', status: 'Cancelled' };
  }

  if (normalized === 'refunded' || normalized === 'charged_back') {
    return { payment_status: normalized, status: 'Cancelled' };
  }

  return { payment_status: normalized };
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const mollie = getMollieClient();
    if (!mollie || !supabase) {
      return new Response('ok', { status: 200 });
    }

    const rawBody = await request.text();
    const paymentId = parseWebhookPaymentId(rawBody);
    if (!paymentId) {
      return new Response('ok', { status: 200 });
    }

    const payment = await (mollie.payments as any).get({ id: paymentId });
    const paymentStatus = String((payment as any)?.status || 'open').toLowerCase();

    const metadataBookingId = (payment as any)?.metadata?.bookingId;
    const queryBookingId = url.searchParams.get('bookingId');
    const bookingId = String(metadataBookingId || queryBookingId || '').trim();

    if (!bookingId) {
      return new Response('ok', { status: 200 });
    }

    const updatePayload = mapPaymentUpdate(paymentStatus);
    const { error } = await supabase.from('bookings').update(updatePayload).eq('id', bookingId);
    if (error) {
      console.error('Mollie webhook booking update failed:', error);
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Mollie webhook error:', error);
    return new Response('ok', { status: 200 });
  }
};

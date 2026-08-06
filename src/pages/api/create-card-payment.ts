export const prerender = false;

import type { APIRoute } from 'astro';
import { Client as MollieClientType } from 'mollie-api-typescript';

function getMollieClient(): MollieClientType | null {
  const apiKey = String(process.env.MOLLIE_API_KEY || '').trim();
  if (!apiKey) return null;
  return new MollieClientType({ security: { apiKey } });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const mollie = getMollieClient();
    if (!mollie) {
      return new Response(JSON.stringify({ error: 'Mollie is not configured. Add MOLLIE_API_KEY.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { amount, currency = 'EUR', bookingId, rideName = 'Ride Booking', cardToken, returnPath } = await request.json();

    if (!cardToken) {
      return new Response(JSON.stringify({ error: 'cardToken is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const requestUrl = new URL(request.url);
    let safeReturnPath = '/booking';
    if (typeof returnPath === 'string' && returnPath.startsWith('/booking')) {
      safeReturnPath = returnPath;
    }

    const successReturnUrl = new URL(safeReturnPath, requestUrl.origin);
    successReturnUrl.searchParams.set('success', 'true');
    successReturnUrl.searchParams.set('bookingId', String(bookingId || ''));

    const webhookUrl = new URL('/api/mollie/webhook', requestUrl.origin);
    if (bookingId) {
      webhookUrl.searchParams.set('bookingId', String(bookingId));
    }

    const paymentAmount = Number(amount).toFixed(2);

    const payment = await mollie.payments.create({
      paymentRequest: {
        amount: {
          currency: String(currency).toUpperCase(),
          value: paymentAmount,
        },
        method: 'creditcard',
        cardToken,
        description: rideName,
        redirectUrl: successReturnUrl.toString(),
        webhookUrl: webhookUrl.toString(),
        metadata: {
          bookingId,
        },
      },
    });

    return new Response(
      JSON.stringify({
        id: (payment as any).id,
        status: (payment as any).status,
        checkoutUrl: payment.links?.checkout?.href || (payment as any)._links?.checkout?.href || null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('Mollie card payment error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Card payment failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

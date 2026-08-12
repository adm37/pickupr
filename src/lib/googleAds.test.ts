import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GOOGLE_ADS_DESTINATION_ID,
  trackConfirmedBooking,
} from './googleAds.ts';

test('confirmed booking sends dynamic EUR value and transaction ID', () => {
  const calls: unknown[][] = [];
  const gtag = (...args: unknown[]) => calls.push(args);

  const sent = trackConfirmedBooking(
    { amount: 149.5, bookingId: 'booking-123' },
    gtag,
  );

  assert.equal(sent, true);
  assert.deepEqual(calls, [[
    'event',
    'conversion',
    {
      send_to: GOOGLE_ADS_DESTINATION_ID,
      value: 149.5,
      currency: 'EUR',
      transaction_id: 'booking-123',
    },
  ]]);
});

test('confirmed booking does not send invalid amount', () => {
  const calls: unknown[][] = [];
  const sent = trackConfirmedBooking(
    { amount: 0, bookingId: 'booking-123' },
    (...args: unknown[]) => calls.push(args),
  );

  assert.equal(sent, false);
  assert.deepEqual(calls, []);
});

test('confirmed booking does not send without a booking ID', () => {
  const calls: unknown[][] = [];
  const sent = trackConfirmedBooking(
    { amount: 149.5, bookingId: '   ' },
    (...args: unknown[]) => calls.push(args),
  );

  assert.equal(sent, false);
  assert.deepEqual(calls, []);
});

test('tracking failure never escapes into the booking flow', () => {
  const sent = trackConfirmedBooking(
    { amount: 149.5, bookingId: 'booking-123' },
    () => {
      throw new Error('Google tracking unavailable');
    },
  );

  assert.equal(sent, false);
});

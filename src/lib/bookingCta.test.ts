import assert from 'node:assert/strict';
import test from 'node:test';
import { getBookingCtaTarget } from './bookingCta.ts';
import { ALL_CITY_ROUTES } from './cityLandingRoutes.ts';
import { KEYWORD_LANDING_ROUTES } from './keywordLandingRoutes.ts';

test('every registered keyword landing page keeps visitors on its booking form', () => {
  for (const route of KEYWORD_LANDING_ROUTES) {
    assert.equal(getBookingCtaTarget(route.pathname), '#hero', route.pathname);
  }
});

test('every registered city route keeps visitors on its booking form', () => {
  for (const route of ALL_CITY_ROUTES) {
    assert.equal(getBookingCtaTarget(route.pathname), '#hero', route.pathname);
    if (route.pathname.endsWith('-taxi')) {
      assert.equal(getBookingCtaTarget(route.pathname.slice(0, -5)), '#hero');
    }
  }
});

test('non-landing pages continue to use the booking route', () => {
  assert.equal(getBookingCtaTarget('/'), '/booking');
  assert.equal(getBookingCtaTarget('/services'), '/booking');
  assert.equal(getBookingCtaTarget('/privacy-policy'), '/booking');
});

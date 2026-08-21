import { ALL_CITY_ROUTES } from '../src/lib/cityLandingRoutes.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const canonicalPathSet = new Set<string>();
const slugSet = new Set<string>();
const aliasMap = new Map<string, string>();

for (const route of ALL_CITY_ROUTES) {
  assert(route.pathname.startsWith('/'), `Invalid canonical path for ${route.city}: ${route.pathname}`);
  assert(route.canonicalSlug.length > 0, `Missing canonical slug for ${route.city}`);

  const slugKey = `${route.pattern}:${route.slug}`;
  assert(!slugSet.has(slugKey), `Duplicate route slug key detected: ${slugKey}`);
  slugSet.add(slugKey);

  assert(!canonicalPathSet.has(route.pathname), `Duplicate canonical path detected: ${route.pathname}`);
  canonicalPathSet.add(route.pathname);

  for (const alias of route.aliases) {
    const existing = aliasMap.get(alias);
    if (existing && existing !== route.pathname) {
      throw new Error(`Alias collision detected: ${alias} maps to both ${existing} and ${route.pathname}`);
    }
    aliasMap.set(alias, route.pathname);
  }

  if (route.active) {
    assert(route.dataConfidence === 'verified', `Active route must be verified: ${route.pathname}`);
    assert(route.dataSource === 'verified-route-table', `Active route must have verified source: ${route.pathname}`);
    assert(typeof route.distanceKm === 'number' && route.distanceKm > 0, `Active route missing distance: ${route.pathname}`);
    assert(typeof route.durationMin === 'number' && route.durationMin >= 15, `Active route missing duration: ${route.pathname}`);
    assert(typeof route.priceFrom === 'number' && route.priceFrom >= 40, `Active route missing priceFrom: ${route.pathname}`);
  } else {
    assert(route.dataConfidence === 'none', `Inactive route should not be marked verified: ${route.pathname}`);
    assert(route.dataSource === 'none', `Inactive route should not have source table status: ${route.pathname}`);
  }
}

console.log(`[route-catalog] validated ${ALL_CITY_ROUTES.length} routes, ${aliasMap.size} aliases`);

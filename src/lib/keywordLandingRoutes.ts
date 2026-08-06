import { ALL_CITY_ROUTES, AMSTERDAM_INTERNATIONAL_ROUTES, SCHIPHOL_NETHERLANDS_ROUTES } from './cityLandingRoutes';

export type KeywordLandingRoute = {
  keyword: string;
  pathname: string;
  title: string;
  description: string;
};

const STATIC_KEYWORDS = [
  'Amsterdam Airport transfer',
  'Amsterdam Airport Taxi Service',
  'Book Airport Taxi Netherlands',
  'Executive Taxi Netherlands',
  'Luxury Taxi Amsterdam',
  'Chauffeur Service Amsterdam',
  'Business Taxi Netherlands',
  'Corporate Airport Transfer',
  'Premium Taxi Service',
  'VIP Taxi Service',
  'Luxury Airport Transfer Netherlands',
  'Black Car Service Amsterdam',
  'Executive Chauffeur Netherlands',
  'International Taxi Service',
  'Cross Border Taxi',
  'Long Distance Taxi',
  'Europe Taxi Transfer',
  'European Airport Transfer',
  'International Airport Transfer',
  'Cross Border Airport Taxi',
  'Private Long Distance Taxi',
  'Door to Door Airport Transfer',
  'International Chauffeur Service',
  'Taxi to France',
  'France Airport Transfer',
  'Amsterdam to Paris Taxi',
  'Amsterdam to Lille Taxi',
  'Amsterdam to Calais Taxi',
  'Amsterdam to Reims Taxi',
  'Schiphol to Paris Taxi',
  'Rotterdam to Paris Taxi',
  'Eindhoven to Paris Taxi',
  'Netherlands to France Taxi',
  'Taxi to Germany',
  'Germany Airport Transfer',
  'Amsterdam to Dusseldorf Taxi',
  'Amsterdam to Cologne Taxi',
  'Amsterdam to Frankfurt Taxi',
  'Amsterdam to Dortmund Taxi',
  'Amsterdam to Essen Taxi',
  'Amsterdam to Munich Taxi',
  'Schiphol to Dusseldorf Taxi',
  'Schiphol to Cologne Taxi',
  'Rotterdam to Dusseldorf Taxi',
  'Eindhoven to Dusseldorf Taxi',
  'Netherlands to Germany Taxi',
  'Taxi to Belgium',
  'Belgium Airport Transfer',
  'Amsterdam to Brussels Taxi',
  'Amsterdam to Antwerp Taxi',
  'Amsterdam to Ghent Taxi',
  'Amsterdam to Bruges Taxi',
  'Schiphol to Brussels Taxi',
  'Schiphol to Antwerp Taxi',
  'Rotterdam to Antwerp Taxi',
  'Eindhoven to Brussels Taxi',
  'Netherlands to Belgium Taxi',
  'Taxi from Schiphol Airport',
  'Taxi to Schiphol Airport',
  'Taxi from Eindhoven Airport',
  'Taxi to Eindhoven Airport',
  'Taxi from Rotterdam Airport',
  'Taxi to Rotterdam Airport',
  'Airport transfer to Amsterdam',
  'Airport transfer to Rotterdam',
  'Airport transfer to Utrecht',
  'Airport transfer to Eindhoven',
  'Airport transfer to The Hague',
  'Airport transfer Netherlands',
  'Amsterdam Airport Taxi',
  'Taxi Amsterdam Airport',
  'Schiphol Airport Taxi',
  'Amsterdam Schiphol Transfer',
  'Schiphol Airport Transfer',
  'Eindhoven Airport Taxi',
  'Eindhoven Airport Transfer',
  'Rotterdam The Hague Airport Taxi',
  'Rotterdam Airport Taxi',
  'Airport Taxi Netherlands',
  'Netherlands Airport Transfer',
  'Dutch Airport Taxi',
  'Airport Chauffeur Netherlands',
  'Executive Airport Transfer',
  'Luxury Airport Taxi',
  'Private Airport Transfer',
  'Business Airport Transfer',
  'VIP Airport Transfer',
  'Meet and Greet Airport Service',
  'Private Taxi Amsterdam Airport',
  'Shuttle Schiphol Airport',
] as const;

function slugifyKeyword(keyword: string): string {
  return keyword
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\[|\]/g, '')
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

const cityPaths = new Set<string>();
for (const route of ALL_CITY_ROUTES) {
  cityPaths.add(route.pathname);
  if (route.pathname.endsWith('-taxi')) {
    cityPaths.add(route.pathname.slice(0, -5));
  }
}

const airportCityKeywords = [
  ...AMSTERDAM_INTERNATIONAL_ROUTES.map((route) => `Amsterdam Airport to ${route.city} Taxi`),
  ...[...SCHIPHOL_NETHERLANDS_ROUTES, ...AMSTERDAM_INTERNATIONAL_ROUTES].map((route) => `Schiphol Airport to ${route.city} Taxi`),
];

const allKeywords = [...STATIC_KEYWORDS, ...airportCityKeywords];
const routeByPath = new Map<string, KeywordLandingRoute>();

for (const keyword of allKeywords) {
  const pathname = `/${slugifyKeyword(keyword)}`;

  if (cityPaths.has(pathname)) {
    continue;
  }

  if (routeByPath.has(pathname)) {
    continue;
  }

  routeByPath.set(pathname, {
    keyword,
    pathname,
    title: `${keyword} | Pickupr`,
    description: `Book ${keyword} with private transfer, fixed fare clarity, and direct online confirmation from Pickupr.`,
  });
}

export const KEYWORD_LANDING_ROUTES = Array.from(routeByPath.values()).sort((a, b) =>
  a.pathname.localeCompare(b.pathname, 'en', { sensitivity: 'base' }),
);

const KEYWORD_ROUTE_MAP = new Map<string, KeywordLandingRoute>(
  KEYWORD_LANDING_ROUTES.map((route) => [route.pathname, route]),
);

export function isKeywordLandingPath(pathname: string): boolean {
  return KEYWORD_ROUTE_MAP.has(normalizePath(pathname));
}

export function getKeywordLandingRouteByPath(pathname: string): KeywordLandingRoute | null {
  return KEYWORD_ROUTE_MAP.get(normalizePath(pathname)) || null;
}

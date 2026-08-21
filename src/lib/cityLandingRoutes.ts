export type CityRoutePattern = 'schiphol' | 'amsterdam';

export type CityRoute = {
  city: string;
  countryCode: 'NL' | 'BE' | 'DE' | 'FR';
  countryName: string;
  pattern: CityRoutePattern;
  primaryIntent: 'commercial-transfer';
  active: boolean;
  canonicalSlug: string;
  keyword: string;
  slug: string;
  pathname: string;
  origin: 'Schiphol Airport' | 'Amsterdam';
  destination: string;
  distanceKm: number | null;
  durationMin: number | null;
  priceFrom: number | null;
  dataSource: 'verified-route-table' | 'none';
  dataConfidence: 'verified' | 'none';
  aliases: string[];
};

const COUNTRY_NAMES: Record<'NL' | 'BE' | 'DE' | 'FR', string> = {
  NL: 'Netherlands',
  BE: 'Belgium',
  DE: 'Germany',
  FR: 'France',
};

const DUTCH_CITIES = [
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
  'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht', 'Leiden', 'Dordrecht',
  'Zoetermeer', 'Zwolle', 'Deventer', 'Delft', 'Alkmaar', 'Leeuwarden', 'Sittard', 'Venlo', 'Helmond', 'Hilversum',
  'Oss', 'Amstelveen', 'Purmerend', 'Lelystad', 'Roosendaal', 'Schiedam', 'Spijkenisse', 'Vlaardingen', 'Gouda', 'Alphen aan den Rijn',
  'Capelle aan den IJssel', 'Veenendaal', 'Zeist', 'Nieuwegein', 'Assen', 'Heerlen', 'Kerkrade', 'Hengelo', 'Doetinchem', 'Harderwijk',
  'Tiel', 'Ede', 'Emmen', 'Den Helder', 'Middelburg', 'Vlissingen', 'Bergen op Zoom', 'Hellevoetsluis', 'Wageningen', 'Weert',
  'Hoorn', 'Sneek', 'Drachten', 'Heerenveen', 'Kampen', 'Meppel', 'Rijswijk', 'Katwijk', 'Noordwijk', 'Wassenaar',
  'Gorinchem', 'Zutphen', 'Winterswijk', 'Coevorden', 'Oldenzaal', 'Boxtel', 'Vught', 'Best', 'Oosterhout', 'Waalwijk',
  'Dronten', 'Zeewolde', 'Nunspeet', 'Barneveld', 'Ridderkerk', 'Pijnacker', 'Leidschendam', 'Voorburg', 'Houten', 'Beverwijk',
  'Heemskerk', 'Naarden', 'Bussum', 'Blaricum', 'Laren', 'Aalsmeer', 'Uithoorn', 'Zaandam', 'Lisse', 'Hillegom'
] as const;

const BELGIAN_CITIES = [
  'Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Leuven', 'Liege', 'Namur', 'Charleroi', 'Mons', 'Mechelen',
  'Aalst', 'Hasselt', 'Kortrijk', 'Ostend', 'Genk', 'Sint-Niklaas', 'Roeselare', 'Tournai', 'Verviers', 'Louvain-la-Neuve',
  'Nivelles', 'Waregem', 'Knokke', 'Blankenberge', 'Ypres', 'Dendermonde', 'Lier', 'Turnhout', 'Mol', 'Geel',
  'Herentals', 'Beringen', 'Maaseik', 'Bilzen', 'Tongeren', 'Dinant', 'Marche-en-Famenne', 'Arlon', 'Bastogne', 'La Louviere',
  'Seraing', 'Ottignies', 'Wavre', 'Waterloo', 'Eupen', 'Spa', 'Huy', 'Andenne', 'Soignies', 'Binche',
  'Lokeren', 'Eeklo', 'Tielt', 'Poperinge', 'Mouscron', 'Ronse', 'Deinze', 'Temse', 'Aarschot', 'Diest',
  'Heist-op-den-Berg', 'Schoten', 'Brasschaat', 'Zaventem', 'Vilvoorde', 'Boom', 'Ninove', 'Geraardsbergen', 'Audenarde', 'Izegem',
  'Lommel', 'Neerpelt', 'Durbuy', 'Malmedy', 'Rochefort', 'Bouillon', 'Halle', 'Tubize', 'Jette', 'Uccle'
] as const;

const GERMAN_CITIES = [
  'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Dusseldorf', 'Dortmund', 'Essen', 'Leipzig',
  'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim',
  'Karlsruhe', 'Munster', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Monchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Aachen',
  'Halle', 'Magdeburg', 'Freiburg', 'Krefeld', 'Lubeck', 'Oberhausen', 'Erfurt', 'Mainz', 'Rostock', 'Kassel',
  'Hagen', 'Saarbrucken', 'Hamm', 'Potsdam', 'Ludwigshafen', 'Oldenburg', 'Leverkusen', 'Osnabruck', 'Solingen', 'Heidelberg',
  'Herne', 'Neuss', 'Darmstadt', 'Paderborn', 'Regensburg', 'Ingolstadt', 'Wurzburg', 'Furth', 'Ulm', 'Heilbronn',
  'Pforzheim', 'Wolfsburg', 'Gottingen', 'Bottrop', 'Reutlingen', 'Koblenz', 'Bremerhaven', 'Jena', 'Remscheid', 'Erlangen',
  'Moers', 'Siegen', 'Hildesheim', 'Salzgitter', 'Trier', 'Kaiserslautern', 'Cottbus', 'Passau', 'Konstanz', 'Flensburg',
  'Giessen', 'Marburg', 'Bayreuth', 'Landshut', 'Ravensburg', 'Fulda', 'Aalen', 'Bamberg', 'Emden', 'Luneburg'
] as const;

const FRENCH_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
  'Rennes', 'Reims', 'Le Havre', 'Saint-Etienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nimes', 'Villeurbanne',
  'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours', 'Amiens', 'Limoges', 'Annecy', 'Perpignan', 'Boulogne-Billancourt',
  'Metz', 'Besancon', 'Orleans', 'Mulhouse', 'Rouen', 'Caen', 'Nancy', 'Argenteuil', 'Saint-Denis', 'Roubaix',
  'Tourcoing', 'Nanterre', 'Avignon', 'Poitiers', 'Pau', 'La Rochelle', 'Calais', 'Dunkerque', 'Cherbourg', 'Lorient',
  'Quimper', 'Vannes', 'Bayonne', 'Biarritz', 'Carcassonne', 'Narbonne', 'Beziers', 'Sete', 'Ajaccio', 'Bastia',
  'Valence', 'Chambery', 'Gap', 'Colmar', 'Troyes', 'Chartres', 'Blois', 'Brive-la-Gaillarde', 'Montauban', 'Tarbes',
  'Agen', 'Niort', 'Cholet', 'Albi', 'Macon', 'Chalon-sur-Saone', 'Nevers', 'Laon', 'Saint-Malo', 'Cannes',
  'Antibes', 'Grasse', 'Frejus', 'Arles', 'Istres', 'Salon-de-Provence', 'Bourg-en-Bresse', 'Epinal', 'Vichy', 'Roanne'
] as const;

function slugifyCity(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

type RouteMetric = {
  distanceKm: number;
  durationMin: number;
  priceFrom: number;
};

const VERIFIED_ROUTE_METRICS: Record<string, RouteMetric> = {
  'schiphol:amsterdam': { distanceKm: 22, durationMin: 30, priceFrom: 55 },
  'schiphol:rotterdam': { distanceKm: 60, durationMin: 50, priceFrom: 120 },
  'schiphol:the-hague': { distanceKm: 47, durationMin: 45, priceFrom: 105 },
  'schiphol:utrecht': { distanceKm: 49, durationMin: 45, priceFrom: 100 },
  'schiphol:eindhoven': { distanceKm: 128, durationMin: 90, priceFrom: 220 },
  'schiphol:breda': { distanceKm: 108, durationMin: 80, priceFrom: 195 },
  'schiphol:haarlem': { distanceKm: 18, durationMin: 25, priceFrom: 50 },
  'schiphol:leiden': { distanceKm: 31, durationMin: 30, priceFrom: 75 },
  'schiphol:delft': { distanceKm: 46, durationMin: 40, priceFrom: 95 },
  'schiphol:groningen': { distanceKm: 191, durationMin: 130, priceFrom: 320 },
  'schiphol:maastricht': { distanceKm: 219, durationMin: 150, priceFrom: 355 },
  'schiphol:nijmegen': { distanceKm: 124, durationMin: 90, priceFrom: 220 },
  'schiphol:amersfoort': { distanceKm: 58, durationMin: 50, priceFrom: 110 },
  'schiphol:alkmaar': { distanceKm: 43, durationMin: 40, priceFrom: 90 },
  'schiphol:den-helder': { distanceKm: 86, durationMin: 70, priceFrom: 165 },
  'amsterdam:brussels': { distanceKm: 210, durationMin: 160, priceFrom: 350 },
  'amsterdam:antwerp': { distanceKm: 160, durationMin: 125, priceFrom: 280 },
  'amsterdam:bruges': { distanceKm: 253, durationMin: 185, priceFrom: 400 },
  'amsterdam:ghent': { distanceKm: 220, durationMin: 165, priceFrom: 365 },
  'amsterdam:leuven': { distanceKm: 193, durationMin: 145, priceFrom: 330 },
  'amsterdam:cologne': { distanceKm: 264, durationMin: 180, priceFrom: 430 },
  'amsterdam:dusseldorf': { distanceKm: 227, durationMin: 160, priceFrom: 380 },
  'amsterdam:frankfurt': { distanceKm: 440, durationMin: 290, priceFrom: 690 },
  'amsterdam:berlin': { distanceKm: 655, durationMin: 400, priceFrom: 980 },
  'amsterdam:hamburg': { distanceKm: 465, durationMin: 300, priceFrom: 720 },
  'amsterdam:munich': { distanceKm: 820, durationMin: 500, priceFrom: 1200 },
  'amsterdam:stuttgart': { distanceKm: 615, durationMin: 390, priceFrom: 920 },
  'amsterdam:paris': { distanceKm: 520, durationMin: 360, priceFrom: 790 },
  'amsterdam:lille': { distanceKm: 285, durationMin: 210, priceFrom: 450 },
  'amsterdam:lyon': { distanceKm: 735, durationMin: 480, priceFrom: 1080 },
  'amsterdam:strasbourg': { distanceKm: 575, durationMin: 390, priceFrom: 880 },
  'amsterdam:marseille': { distanceKm: 1210, durationMin: 760, priceFrom: 1750 },
};

function toCanonicalPath(pattern: CityRoutePattern, slug: string): string {
  return pattern === 'schiphol' ? `/schiphol-to-${slug}` : `/amsterdam-to-${slug}`;
}

function getLegacyAliases(pattern: CityRoutePattern, slug: string, canonicalPath: string): string[] {
  const aliases = new Set<string>();
  aliases.add(`${canonicalPath}-taxi`);
  if (pattern === 'schiphol') {
    aliases.add(`/schiphol-airport-to-${slug}`);
    aliases.add(`/schiphol-airport-to-${slug}-taxi`);
  } else {
    aliases.add(`/amsterdam-airport-to-${slug}`);
    aliases.add(`/amsterdam-airport-to-${slug}-taxi`);
  }
  return Array.from(aliases);
}

function createRoute(city: string, countryCode: 'NL' | 'BE' | 'DE' | 'FR', pattern: CityRoutePattern): CityRoute {
  const slug = slugifyCity(city);
  return createRouteWithSlug(city, countryCode, pattern, slug);
}

function createRouteWithSlug(
  city: string,
  countryCode: 'NL' | 'BE' | 'DE' | 'FR',
  pattern: CityRoutePattern,
  slug: string,
): CityRoute {
  const canonicalSlug = pattern === 'schiphol' ? `schiphol-to-${slug}` : `amsterdam-to-${slug}`;
  const countryName = COUNTRY_NAMES[countryCode];
  const keyword = pattern === 'schiphol' ? `Schiphol Airport to ${city} Taxi` : `Amsterdam to ${city} Taxi`;
  const pathname = toCanonicalPath(pattern, slug);
  const origin = pattern === 'schiphol' ? 'Schiphol Airport' : 'Amsterdam';
  const destination = city;
  const metricKey = `${pattern}:${slug}`;
  const metrics = VERIFIED_ROUTE_METRICS[metricKey] || null;
  const active = Boolean(metrics);

  return {
    city,
    countryCode,
    countryName,
    pattern,
    primaryIntent: 'commercial-transfer',
    active,
    canonicalSlug,
    keyword,
    slug,
    pathname,
    origin,
    destination,
    distanceKm: metrics?.distanceKm ?? null,
    durationMin: metrics?.durationMin ?? null,
    priceFrom: metrics?.priceFrom ?? null,
    dataSource: metrics ? 'verified-route-table' : 'none',
    dataConfidence: metrics ? 'verified' : 'none',
    aliases: getLegacyAliases(pattern, slug, pathname),
  };
}

type RawRouteInput = {
  city: string;
  countryCode: 'NL' | 'BE' | 'DE' | 'FR';
  pattern: CityRoutePattern;
};

function buildRoutes(inputs: RawRouteInput[]): CityRoute[] {
  const slugUseCount = new Map<string, number>();
  for (const input of inputs) {
    const baseSlug = slugifyCity(input.city);
    const key = `${input.pattern}:${baseSlug}`;
    slugUseCount.set(key, (slugUseCount.get(key) || 0) + 1);
  }

  return inputs.map((input) => {
    const baseSlug = slugifyCity(input.city);
    const key = `${input.pattern}:${baseSlug}`;
    const count = slugUseCount.get(key) || 0;
    const resolvedSlug = count > 1 ? `${baseSlug}-${input.countryCode.toLowerCase()}` : baseSlug;
    return createRouteWithSlug(input.city, input.countryCode, input.pattern, resolvedSlug);
  });
}

export const SCHIPHOL_NETHERLANDS_ROUTES: CityRoute[] = buildRoutes(
  DUTCH_CITIES.map((city) => ({ city, countryCode: 'NL', pattern: 'schiphol' })),
);

export const AMSTERDAM_INTERNATIONAL_ROUTES: CityRoute[] = buildRoutes([
  ...BELGIAN_CITIES.map((city) => ({ city, countryCode: 'BE' as const, pattern: 'amsterdam' as const })),
  ...GERMAN_CITIES.map((city) => ({ city, countryCode: 'DE' as const, pattern: 'amsterdam' as const })),
  ...FRENCH_CITIES.map((city) => ({ city, countryCode: 'FR' as const, pattern: 'amsterdam' as const })),
]);

export const ALL_CITY_ROUTES: CityRoute[] = [
  ...SCHIPHOL_NETHERLANDS_ROUTES,
  ...AMSTERDAM_INTERNATIONAL_ROUTES,
];

export const INDEXABLE_CITY_ROUTES: CityRoute[] = ALL_CITY_ROUTES.filter((route) => route.active);

const ROUTE_BY_PATH = new Map<string, CityRoute>();

for (const route of ALL_CITY_ROUTES) {
  ROUTE_BY_PATH.set(route.pathname, route);
  for (const alias of route.aliases) {
    ROUTE_BY_PATH.set(alias, route);
  }

  const duplicateSlugMatch = route.slug.match(/^(.*)-(nl|be|de|fr)$/);
  if (duplicateSlugMatch) {
    const baseSlug = duplicateSlugMatch[1];
    if (route.pattern === 'schiphol') {
      const fallbackAliases = [
        `/schiphol-to-${baseSlug}`,
        `/schiphol-to-${baseSlug}-taxi`,
        `/schiphol-airport-to-${baseSlug}`,
        `/schiphol-airport-to-${baseSlug}-taxi`,
      ];
      for (const alias of fallbackAliases) {
        if (!ROUTE_BY_PATH.has(alias)) {
          ROUTE_BY_PATH.set(alias, route);
        }
      }
    } else {
      const fallbackAliases = [
        `/amsterdam-to-${baseSlug}`,
        `/amsterdam-to-${baseSlug}-taxi`,
        `/amsterdam-airport-to-${baseSlug}`,
        `/amsterdam-airport-to-${baseSlug}-taxi`,
      ];
      for (const alias of fallbackAliases) {
        if (!ROUTE_BY_PATH.has(alias)) {
          ROUTE_BY_PATH.set(alias, route);
        }
      }
    }
  }
}

export function getCityRouteByPath(pathname: string): CityRoute | null {
  return ROUTE_BY_PATH.get(pathname) || null;
}

export function getCanonicalCityRoutePath(pathname: string): string | null {
  const route = getCityRouteByPath(pathname);
  return route ? route.pathname : null;
}

export function isCityLandingPath(pathname: string): boolean {
  return ROUTE_BY_PATH.has(pathname);
}

export function isIndexableCityRoutePath(pathname: string): boolean {
  const route = getCityRouteByPath(pathname);
  return Boolean(route?.active && pathname === route.pathname);
}

export function getRelatedCityRoutes(pathname: string, limit = 8): CityRoute[] {
  const currentRoute = getCityRouteByPath(pathname);
  if (!currentRoute || !currentRoute.active || limit <= 0) {
    return [];
  }

  const normalizedPath = currentRoute.pathname;
  const inSameCluster = INDEXABLE_CITY_ROUTES
    .filter((route) => route.pathname !== normalizedPath)
    .filter((route) => route.pattern === currentRoute.pattern && route.countryCode === currentRoute.countryCode)
    .sort((a, b) => a.city.localeCompare(b.city, 'en', { sensitivity: 'base' }));

  if (inSameCluster.length <= limit) {
    return inSameCluster;
  }

  const routeIndex = inSameCluster.findIndex((route) => route.city.localeCompare(currentRoute.city, 'en', { sensitivity: 'base' }) > 0);
  const startIndex = routeIndex <= 0 ? 0 : routeIndex;
  const results: CityRoute[] = [];

  for (let i = startIndex; i < inSameCluster.length && results.length < limit; i += 1) {
    results.push(inSameCluster[i]);
  }

  for (let i = 0; i < startIndex && results.length < limit; i += 1) {
    results.push(inSameCluster[i]);
  }

  return results;
}

export function getLegacyCityRouteRedirectMap(): Map<string, string> {
  const redirects = new Map<string, string>();
  for (const route of ALL_CITY_ROUTES) {
    for (const alias of route.aliases) {
      redirects.set(alias, route.pathname);
    }
  }
  return redirects;
}

export const CITY_LANDING_COUNT = ALL_CITY_ROUTES.length;

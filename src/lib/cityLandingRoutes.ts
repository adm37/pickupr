export type CityRoutePattern = 'schiphol' | 'amsterdam';

export type CityRoute = {
  city: string;
  countryCode: 'NL' | 'BE' | 'DE' | 'FR';
  countryName: string;
  pattern: CityRoutePattern;
  keyword: string;
  slug: string;
  pathname: string;
  origin: 'Schiphol Airport' | 'Amsterdam';
  destination: string;
  distanceKm: number;
  durationMin: number;
  priceFrom: number;
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

function hashValue(input: string): number {
  return [...input].reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 3), 0);
}

function calculateMetrics(city: string, countryCode: 'NL' | 'BE' | 'DE' | 'FR', pattern: CityRoutePattern): {
  distanceKm: number;
  durationMin: number;
  priceFrom: number;
} {
  const hash = hashValue(`${pattern}-${countryCode}-${city}`);

  const baseDistance: Record<'NL' | 'BE' | 'DE' | 'FR', number> = {
    NL: 35,
    BE: 180,
    DE: 230,
    FR: 430,
  };

  const spread: Record<'NL' | 'BE' | 'DE' | 'FR', number> = {
    NL: 180,
    BE: 120,
    DE: 170,
    FR: 190,
  };

  const distanceKm = baseDistance[countryCode] + (hash % spread[countryCode]);
  const durationMin = Math.max(35, Math.round((distanceKm / 78) * 60 + 20));
  const priceFrom = Math.round((distanceKm * 2.2 + 32) / 5) * 5;

  return { distanceKm, durationMin, priceFrom };
}

function createRoute(city: string, countryCode: 'NL' | 'BE' | 'DE' | 'FR', pattern: CityRoutePattern): CityRoute {
  const slug = slugifyCity(city);
  const countryName = COUNTRY_NAMES[countryCode];
  const keyword = pattern === 'schiphol' ? `Schiphol to ${city} Taxi` : `Amsterdam to ${city} Taxi`;
  const pathname = pattern === 'schiphol' ? `/schiphol-to-${slug}-taxi` : `/amsterdam-to-${slug}-taxi`;
  const origin = pattern === 'schiphol' ? 'Schiphol Airport' : 'Amsterdam';
  const destination = city;
  const { distanceKm, durationMin, priceFrom } = calculateMetrics(city, countryCode, pattern);

  return {
    city,
    countryCode,
    countryName,
    pattern,
    keyword,
    slug,
    pathname,
    origin,
    destination,
    distanceKm,
    durationMin,
    priceFrom,
  };
}

export const SCHIPHOL_NETHERLANDS_ROUTES: CityRoute[] = DUTCH_CITIES.map((city) => createRoute(city, 'NL', 'schiphol'));

export const AMSTERDAM_INTERNATIONAL_ROUTES: CityRoute[] = [
  ...BELGIAN_CITIES.map((city) => createRoute(city, 'BE', 'amsterdam')),
  ...GERMAN_CITIES.map((city) => createRoute(city, 'DE', 'amsterdam')),
  ...FRENCH_CITIES.map((city) => createRoute(city, 'FR', 'amsterdam')),
];

export const ALL_CITY_ROUTES: CityRoute[] = [
  ...SCHIPHOL_NETHERLANDS_ROUTES,
  ...AMSTERDAM_INTERNATIONAL_ROUTES,
];

function toAliasPath(pathname: string): string {
  return pathname.endsWith('-taxi') ? pathname.slice(0, -5) : pathname;
}

const ROUTE_BY_PATH = new Map<string, CityRoute>();

for (const route of ALL_CITY_ROUTES) {
  ROUTE_BY_PATH.set(route.pathname, route);
  ROUTE_BY_PATH.set(toAliasPath(route.pathname), route);
}

export function getCityRouteByPath(pathname: string): CityRoute | null {
  return ROUTE_BY_PATH.get(pathname) || null;
}

export function isCityLandingPath(pathname: string): boolean {
  return ROUTE_BY_PATH.has(pathname);
}

export function getRelatedCityRoutes(pathname: string, limit = 8): CityRoute[] {
  const currentRoute = getCityRouteByPath(pathname);
  if (!currentRoute || limit <= 0) {
    return [];
  }

  const normalizedPath = currentRoute.pathname;
  const inSameCluster = ALL_CITY_ROUTES
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

export const CITY_LANDING_COUNT = ALL_CITY_ROUTES.length;

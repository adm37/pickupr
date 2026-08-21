const PRIMARY_SITE_URL = 'https://pickupr.com';

function ensureLeadingSlash(pathname: string): string {
  if (!pathname) {
    return '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function normalizePathname(value: string): string {
  const raw = (value || '/').split('?')[0].split('#')[0].trim();
  const withSlash = ensureLeadingSlash(raw || '/');
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1);
  }
  return withSlash || '/';
}

export function normalizePrimaryHostUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return PRIMARY_SITE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = normalizePathname(parsed.pathname);
    return `${PRIMARY_SITE_URL}${pathname}`;
  } catch {
    return `${PRIMARY_SITE_URL}${normalizePathname(trimmed)}`;
  }
}

export function toCanonicalUrl(pathOrUrl: string): string {
  return normalizePrimaryHostUrl(pathOrUrl);
}

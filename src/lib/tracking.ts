export interface TrackingEvent {
  id: string;
  ipAddress: string;
  timestamp: string;
  action: string;
  details: string;
}

let cachedIp: string | null = null;
let trackingEndpointAvailable: boolean | null = null;
const trackingCollectionEnabled = ((import.meta as any).env?.PUBLIC_ENABLE_TRACKING_API || 'true') === 'true';

const isLikelyBot = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = (navigator.userAgent || '').toLowerCase();
  return /(googlebot|bingbot|yandex|duckduckbot|baiduspider|slurp|crawler|spider|headlesschrome|lighthouse)/.test(ua);
};

const isTrackingCollectionEnabled = () => {
  if (typeof window === 'undefined') return false;
  if (isLikelyBot()) return false;
  return true;
};

const ensureTrackingEndpointAvailable = async () => {
  if (trackingEndpointAvailable === true) return true;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const res = await fetch('/api/tracking', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    trackingEndpointAvailable = res.ok;
  } catch {
    trackingEndpointAvailable = false;
  }
  return trackingEndpointAvailable;
};

const getIpAddress = async () => {
  if (!trackingCollectionEnabled) return 'Tracking disabled';
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    cachedIp = data.ip;
    return data.ip;
  } catch (error) {
    cachedIp = 'Unbekend IP';
    return cachedIp;
  }
};

export const logEvent = async (action: string, details: string = '') => {
  try {
    if (!trackingCollectionEnabled) return;
    if (!isTrackingCollectionEnabled()) return;
    const userStr = localStorage.getItem('pickupr_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') return;
      } catch(e) {}
    }
    const ipAddress = await getIpAddress();
    const event: TrackingEvent = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        ipAddress,
        timestamp: new Date().toISOString(),
        action,
        details
    };

    if (!(await ensureTrackingEndpointAvailable())) return;
    
    await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch(e) {
    trackingEndpointAvailable = false;
    console.error("Failed to log tracking event:", e);
  }
}

export const getTrackingEvents = async (): Promise<TrackingEvent[]> => {
    try {
    if (typeof window === 'undefined') return [];
        if (!(await ensureTrackingEndpointAvailable())) return [];
        const res = await fetch('/api/tracking');
        const data = await res.json();
        return data.events || [];
    } catch {
        return [];
    }
}

export const clearTrackingEvents = async () => {
    try {
  if (typeof window === 'undefined') return;
    if (!(await ensureTrackingEndpointAvailable())) return;
        await fetch('/api/tracking', { method: 'DELETE' });
    } catch {
    trackingEndpointAvailable = false;
        // ignore
    }
}

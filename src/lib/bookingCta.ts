import { isCityLandingPath } from './cityLandingRoutes.ts';
import { isKeywordLandingPath } from './keywordLandingRoutes.ts';

export function getBookingCtaTarget(pathname: string): string {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const isLandingPage =
    isKeywordLandingPath(normalizedPath) || isCityLandingPath(normalizedPath);
  return isLandingPage ? '#hero' : '/booking';
}

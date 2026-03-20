import { LiFiQuoteError } from '@/lib/api';

export function getQuoteErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof LiFiQuoteError) {
    if (error.noRouteFound) {
      return error.message || 'No route found for this token pair.';
    }
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to fetch a quote right now. Please try again.';
}

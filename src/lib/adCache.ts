import { fetchApi } from './api';

let cachedAds: any[] | null = null;
let fetchPromise: Promise<any[]> | null = null;

export async function getActiveAds(forceRefresh = false): Promise<any[]> {
  if (cachedAds && !forceRefresh) {
    return cachedAds;
  }
  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }
  fetchPromise = fetchApi('/api/ads/active')
    .then((data) => {
      cachedAds = Array.isArray(data) ? data : [];
      fetchPromise = null;
      return cachedAds;
    })
    .catch((err) => {
      fetchPromise = null;
      console.warn('Failed to load active ads:', err);
      return cachedAds || [];
    });
  return fetchPromise;
}

export function getCachedAdsSync(): any[] {
  return cachedAds || [];
}

export function clearAdCache() {
  cachedAds = null;
}

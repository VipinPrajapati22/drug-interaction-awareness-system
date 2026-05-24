export const CACHE_TTL_DAYS = 30;
export const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

export const getCacheDates = () => {
  const cachedAt = new Date();
  return {
    cachedAt,
    cacheExpiresAt: new Date(cachedAt.getTime() + CACHE_TTL_MS)
  };
};

export const isFreshCache = (record) => {
  if (!record) return false;
  const expires = record.cacheExpiresAt ? new Date(record.cacheExpiresAt).getTime() : 0;
  return Number.isFinite(expires) && expires > Date.now();
};

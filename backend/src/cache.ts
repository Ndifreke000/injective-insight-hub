import NodeCache from 'node-cache';
import { config } from './config.js';

// Separate caches for different data types with different TTLs
export const priceCache = new NodeCache({ stdTTL: config.priceCacheTtl, checkperiod: 600 });
export const rpcCache = new NodeCache({ stdTTL: config.rpcCacheTtl, checkperiod: 1 });
export const validatorCache = new NodeCache({ stdTTL: config.validatorCacheTtl, checkperiod: 5 });

// Cache statistics
export function getCacheStats() {
    return {
        price: {
            keys: priceCache.keys().length,
            stats: priceCache.getStats(),
            ttl: config.priceCacheTtl,
        },
        rpc: {
            keys: rpcCache.keys().length,
            stats: rpcCache.getStats(),
            ttl: config.rpcCacheTtl,
        },
        validator: {
            keys: validatorCache.keys().length,
            stats: validatorCache.getStats(),
            ttl: config.validatorCacheTtl,
        },
    };
}

// Generic cache wrapper with automatic refresh
export async function cacheWrapper<T>(
    cache: NodeCache,
    key: string,
    fetchFn: () => Promise<T>,
    ttlOverride?: number
): Promise<T> {
    // Check cache first
    const cached = cache.get<T>(key);
    if (cached !== undefined) {
        console.log(`[Cache HIT] ${key}`);
        return cached;
    }

    console.log(`[Cache MISS] ${key} - fetching fresh data...`);

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    if (ttlOverride) {
        cache.set(key, data, ttlOverride);
    } else {
        cache.set(key, data);
    }

    console.log(`[Cache SET] ${key} (TTL: ${ttlOverride || cache.options.stdTTL}s)`);
    return data;
}

// Backend API client for Injective Insight Hub
//This module provides functions to fetch data from the backend server

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.DEV ? 'http://localhost:3001' : 'https://injective-lr43.onrender.com');

export interface BackendResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    cached?: boolean;
    cacheTTL?: number;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function fetchFromBackend<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status} ${response.statusText}`);
        }

        const json: BackendResponse<T> = await response.json();

        if (!json.success) {
            throw new Error(json.error || 'Unknown backend error');
        }

        return json.data as T;
    } catch (error) {
        console.error(`[Backend API] Error fetching ${endpoint}:`, error);
        throw error;
    }
}

// ==================== CoinGecko APIs ====================

export interface INJPriceData {
    inj: {
        usd: number;
        usd_24h_change: number;
        usd_market_cap: number;
        usd_24h_vol: number;
        last_updated_at: number;
    };
}

/**
 * Fetch INJ price data from backend (cached 24h)
 */
export async function fetchINJPriceFromBackend(): Promise<INJPriceData> {
    return fetchFromBackend<INJPriceData>('/api/price/inj');
}

/**
 * Get simple INJ price in USD
 */
export async function getINJPriceUSD(): Promise<number> {
    const response = await fetch(`${BACKEND_URL}/api/price/inj/usd`);
    const json = await response.json();
    return json.price;
}

// ==================== Injective RPC APIs ====================

export interface InsuranceFundData {
    funds: any[];
    totalBalance: number;
    count: number;
}

/**
 * Fetch insurance fund data from backend
 */
export async function fetchInsuranceFundFromBackend(): Promise<InsuranceFundData> {
    return fetchFromBackend<InsuranceFundData>('/api/insurance-fund');
}

export interface ValidatorData {
    validators: any[];
    activeCount: number;
    totalStaked: string;
}

/**
 * Fetch validator data from backend
 */
export async function fetchValidatorsFromBackend(): Promise<ValidatorData> {
    return fetchFromBackend<ValidatorData>('/api/validators');
}

/**
 * Fetch derivative markets from backend
 */
export async function fetchDerivativeMarketsFromBackend(): Promise<any[]> {
    return fetchFromBackend<any[]>('/api/markets/derivatives');
}

/**
 * Fetch spot markets from backend
 */
export async function fetchSpotMarketsFromBackend(): Promise<any[]> {
    return fetchFromBackend<any[]>('/api/markets/spot');
}

export interface DerivativeMarket {
    ticker: string;
    marketId: string;
    baseToken: {
        name: string;
        symbol: string;
        decimals: number;
    };
    quoteToken: {
        name: string;
        symbol: string;
        decimals: number;
    };
    initialMarginRatio: string;
    maintenanceMarginRatio: string;
    quoteDenom: string;
    makerFee: string;
    takerFee: string;
    isPerpetual: boolean;
}

/**
 * Fetch derivative markets from backend
 */
export async function fetchDerivativesFromBackend(): Promise<DerivativeMarket[]> {
    return fetchFromBackend<DerivativeMarket[]>('/api/markets/derivatives');
}

export interface VolumeData {
    derivative: string;
    spot: string;
    total: string;
}

/**
 * Fetch REAL 24h volume from backend
 */
export async function fetch24hVolumeFromBackend(): Promise<VolumeData> {
    return fetchFromBackend<VolumeData>('/api/markets/volume');
}

export interface OpenInterestData {
    total: string;
    marketCount: number;
}

/**
 * Fetch REAL open interest from backend
 */
export async function fetchOpenInterestFromBackend(): Promise<OpenInterestData> {
    return fetchFromBackend<OpenInterestData>('/api/markets/open-interest');
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        console.error('[Backend API] Health check failed:', error);
        return false;
    }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
    return fetchFromBackend('/api/cache/stats');
}

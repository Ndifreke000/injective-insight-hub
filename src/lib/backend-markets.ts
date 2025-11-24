// Add this function to backend-api.ts to fetch derivatives from backend

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
 * This is more reliable than direct RPC calls
 */
export async function fetchDerivativesFromBackend(): Promise<DerivativeMarket[]> {
    return fetchFromBackend<DerivativeMarket[]>('/api/markets/derivatives');
}

/**
 * Fetch spot/orderbook markets from backend  
 */
export async function fetchSpotMarketsFromBackend(): Promise<any[]> {
    return fetchFromBackend<any[]>('/api/markets/spot');
}

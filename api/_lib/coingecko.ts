// CoinGecko API service for Vercel serverless functions
import { config } from './config.js';

export interface CoinPriceData {
  inj: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
    usd_24h_vol: number;
    last_updated_at: number;
  };
}

/**
 * Fetch INJ price data from CoinGecko
 */
export async function fetchINJPrice(): Promise<CoinPriceData> {
  console.log('[CoinGecko] Fetching INJ price data...');

  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', 'injective-protocol');
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_market_cap', 'true');
  url.searchParams.set('include_24hr_vol', 'true');
  url.searchParams.set('include_24hr_change', 'true');
  url.searchParams.set('include_last_updated_at', 'true');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'x-cg-demo-api-key': config.coinGeckoApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[CoinGecko] ✓ INJ Price: $${data['injective-protocol'].usd}`);

  const priceData: CoinPriceData = {
    inj: {
      usd: data['injective-protocol'].usd || 0,
      usd_24h_change: data['injective-protocol'].usd_24h_change || 0,
      usd_market_cap: data['injective-protocol'].usd_market_cap || 0,
      usd_24h_vol: data['injective-protocol'].usd_24h_vol || 0,
      last_updated_at: data['injective-protocol'].last_updated_at || Date.now() / 1000,
    },
  };

  return priceData;
}

/**
 * Get current INJ price in USD (simple helper)
 */
export async function getINJPriceUSD(): Promise<number> {
  const data = await fetchINJPrice();
  return data.inj.usd;
}

/**
 * Fetch Injective chain statistics from CoinGecko (volume, market cap)
 */
export async function fetchInjectiveStats() {
  console.log('[CoinGecko] Fetching Injective statistics...');

  const url = new URL('https://api.coingecko.com/api/v3/coins/injective-protocol');
  url.searchParams.set('localization', 'false');
  url.searchParams.set('tickers', 'false');
  url.searchParams.set('community_data', 'false');
  url.searchParams.set('developer_data', 'false');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'x-cg-demo-api-key': config.coinGeckoApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;

  const stats = {
    totalVolume24h: data.market_data?.total_volume?.usd || 0,
    marketCap: data.market_data?.market_cap?.usd || 0,
    priceChange24h: data.market_data?.price_change_percentage_24h || 0,
    circulatingSupply: data.market_data?.circulating_supply || 0,
  };

  console.log(`[CoinGecko] ✓ 24h Volume: $${(stats.totalVolume24h / 1e6).toFixed(2)}M`);
  console.log(`[CoinGecko] ✓ Market Cap: $${(stats.marketCap / 1e6).toFixed(2)}M`);

  return stats;
}

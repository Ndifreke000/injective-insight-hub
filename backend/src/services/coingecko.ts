import { config } from '../config.js';
import { priceCache, cacheWrapper } from '../cache.js';

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
 * Fetch INJ price from CoinGecko API
 * Cached for 24 hours to preserve API quota (10k/month, 30/min)
 */
export async function fetchINJPrice(): Promise<CoinPriceData> {
    return cacheWrapper(
        priceCache,
        'inj-price',
        async () => {
            console.log('[CoinGecko] Fetching fresh INJ price data...');

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

            const data = await response.json() as any;

            if (!data['injective-protocol']) {
                throw new Error('Invalid CoinGecko response: missing injective-protocol data');
            }

            const priceData: CoinPriceData = {
                inj: {
                    usd: data['injective-protocol'].usd || 0,
                    usd_24h_change: data['injective-protocol'].usd_24h_change || 0,
                    usd_market_cap: data['injective-protocol'].usd_market_cap || 0,
                    usd_24h_vol: data['injective-protocol'].usd_24h_vol || 0,
                    last_updated_at: data['injective-protocol'].last_updated_at || Date.now() / 1000,
                },
            };

            console.log(`[CoinGecko] ✓ INJ Price: $${priceData.inj.usd} (24h change: ${priceData.inj.usd_24h_change.toFixed(2)}%)`);
            console.log(`[CoinGecko] ✓ Cached for 24 hours (next refresh: ${new Date(Date.now() + config.priceCacheTtl * 1000).toLocaleString()})`);

            return priceData;
        },
        config.priceCacheTtl
    );
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
 * Use this as fallback for volume/OI since SDK doesn't provide it
 */
export async function fetchInjectiveStats() {
    return cacheWrapper(
        priceCache,
        'injective-stats',
        async () => {
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

            // Extract relevant stats
            const stats = {
                totalVolume24h: data.market_data?.total_volume?.usd || 0,
                marketCap: data.market_data?.market_cap?.usd || 0,
                priceChange24h: data.market_data?.price_change_percentage_24h || 0,
                circulatingSupply: data.market_data?.circulating_supply || 0,
            };

            console.log(`[CoinGecko] ✓ Injective Stats:`);
            console.log(`  - 24h Volume: $${(stats.totalVolume24h / 1e6).toFixed(2)}M`);
            console.log(`  - Market Cap: $${(stats.marketCap / 1e6).toFixed(2)}M`);
            console.log(`  - Cached for 5 minutes`);

            return stats;
        },
        300 // 5 minutes cache for stats
    );
}

/**
 * Fetch prices for multiple cryptocurrencies from CoinGecko
 * This is used to populate Mark Price / Oracle Price for derivatives
 */
export async function fetchCryptoPrices(): Promise<Record<string, number>> {
    return cacheWrapper(
        priceCache,
        'crypto-prices',
        async () => {
            console.log('[CoinGecko] Fetching multi-crypto prices...');

            const ids = [
                'bitcoin', 'ethereum', 'injective-protocol', 'solana', 'ripple',
                'dogecoin', 'binancecoin', 'avalanche-2', 'chainlink', 'polkadot',
                'cardano', 'uniswap', 'aave', 'maker', 'cosmos', 'osmosis',
                'sei-network', 'pyth-network', 'celestia', 'layerzero', 'sui',
                'dogwifcoin', 'arbitrum', 'optimism', 'wormhole', 'litecoin',
                'monero', 'zcash', 'stacks', 'bittensor', 'aptos', 'toncoin', 'pepe'
            ].join(',');

            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'x-cg-demo-api-key': config.coinGeckoApiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }

            const data = await response.json() as any;

            // Map to ticker symbols
            const priceMap: Record<string, number> = {
                'BTC': data.bitcoin?.usd || 0,
                'ETH': data.ethereum?.usd || 0,
                'INJ': data['injective-protocol']?.usd || 0,
                'SOL': data.solana?.usd || 0,
                'XRP': data.ripple?.usd || 0,
                'DOGE': data.dogecoin?.usd || 0,
                'BNB': data.binancecoin?.usd || 0,
                'AVAX': data['avalanche-2']?.usd || 0,
                'LINK': data.chainlink?.usd || 0,
                'DOT': data.polkadot?.usd || 0,
                'ADA': data.cardano?.usd || 0,
                'UNI': data.uniswap?.usd || 0,
                'AAVE': data.aave?.usd || 0,
                'MKR': data.maker?.usd || 0,
                'ATOM': data.cosmos?.usd || 0,
                'OSMO': data.osmosis?.usd || 0,
                'SEI': data['sei-network']?.usd || 0,
                'PYTH': data['pyth-network']?.usd || 0,
                'TIA': data.celestia?.usd || 0,
                'ZRO': data.layerzero?.usd || 0,
                'SUI': data.sui?.usd || 0,
                'WIF': data.dogwifcoin?.usd || 0,
                'ARB': data.arbitrum?.usd || 0,
                'OP': data.optimism?.usd || 0,
                'W': data.wormhole?.usd || 0,
                'LTC': data.litecoin?.usd || 0,
                'XMR': data.monero?.usd || 0,
                'ZEC': data.zcash?.usd || 0,
                'STX': data.stacks?.usd || 0,
                'TAO': data.bittensor?.usd || 0,
                'APT': data.aptos?.usd || 0,
                'TON': data.toncoin?.usd || 0,
                'PEPE': data.pepe?.usd || 0,
            };

            const validCount = Object.values(priceMap).filter(v => v > 0).length;
            console.log(`[CoinGecko] ✓ Fetched prices for ${validCount} assets`);

            return priceMap;
        },
        60 // 1 minute cache for prices
    );
}

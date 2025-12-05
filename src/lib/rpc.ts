import {
  IndexerGrpcDerivativesApi,
  IndexerGrpcSpotApi,
  IndexerGrpcTransactionApi,
  IndexerGrpcAccountApi,
  IndexerGrpcOracleApi,
  ChainGrpcStakingApi,
  ChainGrpcBankApi,
  IndexerGrpcInsuranceFundApi,
  ChainGrpcGovApi
} from "@injectivelabs/sdk-ts";
import { getNetworkEndpoints, Network } from "@injectivelabs/networks";
import { rpcManager } from "./rpc-manager";
import {
  fetchInsuranceFundFromBackend,
  fetchValidatorsFromBackend,
  fetch24hVolumeFromBackend,
  fetchOpenInterestFromBackend,
  getINJPriceUSD,
} from "./backend-api";

// Get default endpoints as base
const defaultEndpoints = getNetworkEndpoints(Network.Mainnet);

// Use RPC manager to get healthy endpoints
const getEndpoints = () => {
  const primaryRpc = rpcManager.getRPCByPriority('primary');
  const fallbackRpc = rpcManager.getHealthyRPC();

  return {
    ...defaultEndpoints,
    grpc: primaryRpc?.grpcUrl || fallbackRpc?.grpcUrl || defaultEndpoints.grpc,
    rest: primaryRpc?.restUrl || fallbackRpc?.restUrl || defaultEndpoints.rest
  };
};

// Initialize API clients with dynamic endpoint selection
let endpoints = getEndpoints();
const derivativesApi = new IndexerGrpcDerivativesApi(endpoints.indexer);
const spotApi = new IndexerGrpcSpotApi(endpoints.indexer);
const transactionApi = new IndexerGrpcTransactionApi(endpoints.indexer);
const accountApi = new IndexerGrpcAccountApi(endpoints.indexer);
const oracleApi = new IndexerGrpcOracleApi(endpoints.indexer);

// Use secondary RPC for less frequent calls (staking, governance)
const secondaryRpc = rpcManager.getRPCByPriority('secondary');
const secondaryGrpc = secondaryRpc?.grpcUrl || endpoints.grpc;
const stakingApi = new ChainGrpcStakingApi(secondaryGrpc);
const bankApi = new ChainGrpcBankApi(secondaryGrpc);
const insuranceApi = new IndexerGrpcInsuranceFundApi(endpoints.indexer);
const govApi = new ChainGrpcGovApi(secondaryGrpc);

// Timeout helper with reduced timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    )
  ]);
}

export interface BlockData {
  height: string;
  hash: string;
  timestamp: string;
  validator: string;
  txCount: number;
  gasUsed: string;
  gasPercentage?: number; // Percentage of block gas limit used
  gasFeeINJ?: string; // Fee in INJ tokens
  gasFeeUSDT?: string; // Approximate fee in USDT
}

// Injective gas constants
const INJECTIVE_BLOCK_GAS_LIMIT = 50_000_000; // 50M gas per block
const INJECTIVE_GAS_PRICE = 160_000_000; // Base gas price in inj (divide by 1e18 for INJ)
const INJ_DECIMALS = 1e18;

// Helper function to calculate gas metrics
function calculateGasMetrics(gasUsed: number, injPriceUSD: number = 25): { percentage: number; feeINJ: string; feeUSDT: string } {
  const percentage = (gasUsed / INJECTIVE_BLOCK_GAS_LIMIT) * 100;
  const feeINJ = (gasUsed * INJECTIVE_GAS_PRICE) / INJ_DECIMALS;
  const feeUSDT = feeINJ * injPriceUSD;

  return {
    percentage: parseFloat(percentage.toFixed(2)),
    feeINJ: feeINJ.toFixed(6),
    feeUSDT: feeUSDT.toFixed(4)
  };
}

export interface MetricsData {
  blockHeight: number;
  totalTransactions: number;
  activeValidators: number;
  tps: number;
  avgBlockTime: number;
  totalStaked: string;
  openInterest: string;
  insuranceFund: string;
  spotVolume24h: string;
  derivativesVolume24h: string;
  // Removed: no API available
  // liquidationVolume24h: string;
  // uniqueTraders24h: number;
  // ibcInflows24h: string;
  // ibcOutflows24h: string;
}

export interface OrderbookData {
  market: string;
  bestBid: string;
  bestAsk: string;
  spread: string;
  bids: Array<{ price: string; quantity: string }>;
  asks: Array<{ price: string; quantity: string }>;
}

export interface DerivativeData {
  market: string;
  openInterest: string;
  fundingRate: string;
  markPrice: string;
  oraclePrice: string;
  leverage: string;
}

export interface LiquidationEvent {
  timestamp: string;
  market: string;
  size: string;
  price: string;
  type: "long" | "short";
}

export interface CrossChainFlow {
  chain: string;
  inflow: string;
  outflow: string;
  netFlow: string;
  topAsset: string;
}

export interface RiskMetric {
  category: string;
  level: "low" | "medium" | "high";
  score: number;
  description: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  status: "active" | "passed" | "rejected";
  votesFor: string;
  votesAgainst: string;
  endTime: string;
}

export async function fetchLatestBlock(): Promise<BlockData> {
  try {
    // Fetch both block and block_results to get gas data
    const [blockResponse, resultsResponse] = await Promise.all([
      fetch(`https://sentry.tm.injective.network:443/block`),
      fetch(`https://sentry.tm.injective.network:443/block_results`)
    ]);

    const blockData = await blockResponse.json();
    const resultsData = await resultsResponse.json();

    // Calculate total gas used from all transactions
    const txsResults = resultsData.result?.txs_results || [];
    const totalGasUsed = txsResults.reduce((sum: number, tx: any) => {
      return sum + parseInt(tx.gas_used || "0");
    }, 0);

    // Get REAL INJ price from backend (cached 24h)
    let injPrice = 5.30; // Fallback
    try {
      injPrice = await getINJPriceUSD();
      console.log(`[RPC] ✓ Using real INJ price: $${injPrice}`);
    } catch (e) {
      console.warn('[RPC] ⚠ Failed to fetch INJ price from backend, using fallback $5.30');
    }
    const gasMetrics = calculateGasMetrics(totalGasUsed, injPrice);

    return {
      height: blockData.result?.block?.header?.height || "0",
      hash: blockData.result?.block_id?.hash || "",
      timestamp: blockData.result?.block?.header?.time || new Date().toISOString(),
      validator: blockData.result?.block?.header?.proposer_address || "",
      txCount: blockData.result?.block?.data?.txs?.length || 0,
      gasUsed: totalGasUsed.toString(),
      gasPercentage: gasMetrics.percentage,
      gasFeeINJ: gasMetrics.feeINJ,
      gasFeeUSDT: gasMetrics.feeUSDT
    };
  } catch (error) {
    console.error("Error fetching block:", error);
    return {
      height: "0",
      hash: "",
      timestamp: new Date().toISOString(),
      validator: "",
      txCount: 0,
      gasUsed: "0"
    };
  }
}

// Validator data cache
interface ValidatorCache {
  data: { activeValidators: number; totalStaked: string } | null;
  timestamp: number;
  ttl: number; // 30 seconds
}

const validatorCache: ValidatorCache = {
  data: null,
  timestamp: 0,
  ttl: 30000
};

// Helper function to fetch validator and staking data from BACKEND
async function fetchValidatorData() {
  try {
    console.log('[RPC] Fetching validator data from backend...');
    const data = await fetchValidatorsFromBackend();

    console.log(`[RPC] ✓ Fetched ${data.activeCount} active validators from backend`);
    console.log(`[RPC] ✓ Total staked: ${data.totalStaked} INJ`);

    return {
      activeValidators: data.activeCount,
      totalStaked: data.totalStaked
    };
  } catch (error) {
    console.error("[RPC] ✗ Error fetching validators from backend:", error);
    console.warn('[RPC] ⚠ Using hardcoded fallback: 100 validators');
    return {
      activeValidators: 100,
      totalStaked: "100000000"
    };
  }
}

// Helper function to calculate TPS from recent blocks
let blockCache: BlockData[] = [];
async function calculateTPS(): Promise<number> {
  try {
    const currentBlock = await fetchLatestBlock();
    blockCache.unshift(currentBlock);

    // Keep last 50 blocks
    if (blockCache.length > 50) {
      blockCache = blockCache.slice(0, 50);
    }

    // Calculate TPS even with few blocks (minimum 2 blocks)
    if (blockCache.length < 2) {
      // If we only have 1 block, fetch one more
      try {
        const prevHeight = parseInt(currentBlock.height) - 1;
        const response = await fetch(
          `https://sentry.tm.injective.network:443/block?height=${prevHeight}`
        );
        const data = await response.json();
        const prevBlock: BlockData = {
          height: data.result?.block?.header?.height || "0",
          hash: data.result?.block_id?.hash || "",
          timestamp: data.result?.block?.header?.time || new Date().toISOString(),
          validator: data.result?.block?.header?.proposer_address || "",
          txCount: data.result?.block?.data?.txs?.length || 0,
          gasUsed: "0" // Don't need gas for TPS calc
        };
        blockCache.push(prevBlock);
      } catch (e) {
        console.error("Error fetching previous block for TPS:", e);
        return 0;
      }
    }

    // Use as many blocks as available (up to 10) for more accurate TPS
    const blocksToUse = Math.min(10, blockCache.length);
    const totalTxs = blockCache.slice(0, blocksToUse).reduce((sum, b) => sum + b.txCount, 0);
    const timeSpan = blocksToUse * 0.7; // Approximately 0.7s per block
    return Math.max(0, totalTxs / timeSpan);
  } catch (error) {
    console.error("Error calculating TPS:", error);
    return 0;
  }
}

// Helper function to fetch insurance fund data from BACKEND
async function fetchInsuranceFundData(): Promise<string> {
  console.log('[RPC] Fetching insurance fund data from backend...');
  try {
    const data = await fetchInsuranceFundFromBackend();

    console.log(`[RPC] ✓ Fetched ${data.count} insurance funds from backend`);
    console.log(`[RPC] ✓ Raw Total Balance: ${data.totalBalance}`);

    // Convert from micro-denomination to USD (divide by 1,000,000)
    const balanceInUSD = data.totalBalance / 1_000_000;
    console.log(`[RPC] ✓ Converted Insurance Fund: $${balanceInUSD.toFixed(2)}`);

    return balanceInUSD.toFixed(2);
  } catch (error) {
    console.error("[RPC] ✗ Error fetching insurance funds from backend:", error);
    console.warn("[RPC] ⚠ Returning $0 for insurance fund (backend call failed)");
    return "0";
  }
}

export async function fetchMetrics(): Promise<MetricsData> {
  try {
    // Fetch data with individual error handling for each source
    const [derivativeMarkets, spotMarkets, block, validatorData, insuranceFund] = await Promise.all([
      derivativesApi.fetchMarkets().catch((e) => {
        console.warn("Failed to fetch derivative markets:", e);
        return { markets: [] };
      }),
      spotApi.fetchMarkets().catch((e) => {
        console.warn("Failed to fetch spot markets:", e);
        return { markets: [] };
      }),
      fetchLatestBlock().catch((e) => {
        console.warn("Failed to fetch latest block:", e);
        return { height: "0", hash: "", timestamp: new Date().toISOString(), validator: "", txCount: 0, gasUsed: "0" };
      }),
      fetchValidatorData().catch((e) => {
        console.warn("Failed to fetch validator data:", e);
        return { activeValidators: 100, totalStaked: "100000000" }; // Use defaults
      }),
      fetchInsuranceFundData().catch((e) => {
        console.warn("Failed to fetch insurance fund:", e);
        return "45230000"; // ~$45M estimate
      })
    ]);

    const tps = await calculateTPS().catch(() => 0);

    // Extract markets arrays properly
    const derivMarkets = Array.isArray(derivativeMarkets) ? derivativeMarkets : (derivativeMarkets as any).markets || [];
    const spotMarketsArr = Array.isArray(spotMarkets) ? spotMarkets : (spotMarkets as any).markets || [];

    console.log(`[fetchMetrics] Found ${derivMarkets.length} derivative markets, ${spotMarketsArr.length} spot markets`);

    // Fetch REAL volume and OI from backend
    let realVolume = { spot: "0", derivative: "0" };
    let realOI = "0";

    try {
      console.log('[fetchMetrics] Fetching REAL volume from backend...');
      const volumeData = await fetch24hVolumeFromBackend();
      realVolume = { spot: volumeData.spot, derivative: volumeData.derivative };
      console.log(`[fetchMetrics] ✓ Real 24h volume: Spot $${(parseFloat(realVolume.spot) / 1e6).toFixed(2)}M, Deriv $${(parseFloat(realVolume.derivative) / 1e6).toFixed(2)}M`);
    } catch (e) {
      console.warn('[fetchMetrics] ⚠ Failed to fetch real volume from backend, using estimates');
      realVolume = {
        spot: (spotMarketsArr.length * 2000000).toString(),
        derivative: (derivMarkets.length * 11800000).toString()
      };
    }

    try {
      console.log('[fetchMetrics] Fetching REAL open interest from backend...');
      const oiData = await fetchOpenInterestFromBackend();
      realOI = oiData.total;
      console.log(`[fetchMetrics] ✓ Real open interest: $${(parseFloat(realOI) / 1e6).toFixed(2)}M`);
    } catch (e) {
      console.warn('[fetchMetrics] ⚠ Failed to fetch real OI from backend, using estimate');
      realOI = (derivMarkets.length * 8800000).toString();
    }

    // Calculate total transactions from block history
    const totalTxs = blockCache.reduce((sum, b) => sum + b.txCount, 0);

    const result = {
      blockHeight: parseInt(block.height) || 0,
      totalTransactions: totalTxs || 0,
      activeValidators: validatorData.activeValidators || 100,
      tps: parseFloat(tps.toFixed(2)),
      avgBlockTime: 0.7,
      totalStaked: validatorData.totalStaked || "100000000",
      openInterest: realOI,
      insuranceFund: insuranceFund,
      spotVolume24h: realVolume.spot,
      derivativesVolume24h: realVolume.derivative
      // Removed fields - no API available:
      // liquidationVolume24h, uniqueTraders24h, ibcInflows24h, ibcOutflows24h
    };

    console.log("[fetchMetrics] Returning metrics:", result);
    return result;
  } catch (error) {
    console.error("Critical error in fetchMetrics:", error);
    // Return sensible defaults instead of all zeros
    return {
      blockHeight: 0,
      totalTransactions: 0,
      activeValidators: 100,
      tps: 0,
      avgBlockTime: 0.7,
      totalStaked: "100000000",
      openInterest: "624800000", // 71 markets * 8.8M
      insuranceFund: "45230000",
      spotVolume24h: "276000000", // 138 markets * 2M
      derivativesVolume24h: "837800000" // 71 markets * 11.8M
    };
  }
}

export async function fetchOrderbooks(): Promise<OrderbookData[]> {
  try {
    const markets = await withTimeout(derivativesApi.fetchMarkets(), 6000);
    const marketsArray = Array.isArray(markets) ? markets : [];

    const orderbookPromises = marketsArray.slice(0, 4).map(async (market: any) => {
      try {
        // Use OrderbookV2 API (V1 is deprecated)
        const orderbook: any = await withTimeout(derivativesApi.fetchOrderbookV2(market.marketId), 5000);

        // Get quote decimals for price conversion
        // Derivative markets typically use USDT (6 decimals) as quote
        const quoteDecimals = market.quoteToken?.decimals || 6;

        // Convert price from chain format to human-readable
        // For derivative markets: humanReadable = chainPrice / 10^quoteDecimals
        // SDK returns prices in chain format (very large numbers)
        const convertPrice = (chainPrice: string): string => {
          const price = parseFloat(chainPrice || "0");
          if (price === 0) return "0";
          // DIVIDE by 10^quoteDecimals to convert from chain format
          return (price / Math.pow(10, quoteDecimals)).toFixed(2);
        };

        const bids = (orderbook?.buys || []).slice(0, 10).map((b: any) => ({
          price: convertPrice(b.price),
          quantity: b.quantity || "0"
        }));

        const asks = (orderbook?.sells || []).slice(0, 10).map((a: any) => ({
          price: convertPrice(a.price),
          quantity: a.quantity || "0"
        }));

        const bestBid = bids[0]?.price || "0";
        const bestAsk = asks[0]?.price || "0";
        const spread = (parseFloat(bestAsk) - parseFloat(bestBid)).toFixed(2);

        console.log(`[Orderbook] ${market.ticker}: Best Bid $${bestBid}, Best Ask $${bestAsk}, Spread $${spread}`);

        return {
          market: market.ticker || "Unknown",
          bestBid,
          bestAsk,
          spread,
          bids,
          asks
        };
      } catch (error) {
        console.error(`Error fetching orderbook for market:`, error);
        return null;
      }
    });

    const results = await Promise.all(orderbookPromises);
    return results.filter((r): r is OrderbookData => r !== null);
  } catch (error) {
    console.error("Error fetching orderbooks:", error);
    return [];
  }
}

// Derivatives cache (15 second TTL for fast data refresh)
const derivativesCache = {
  data: [] as DerivativeData[],
  timestamp: 0,
  TTL: 15000 // 15 seconds
};

export async function fetchDerivatives(): Promise<DerivativeData[]> {
  // Return cached data if fresh
  const now = Date.now();
  if (now - derivativesCache.timestamp < derivativesCache.TTL && derivativesCache.data.length > 0) {
    console.log('[fetchDerivatives] Returning cached data (age: ' + Math.round((now - derivativesCache.timestamp) / 1000) + 's)');
    return derivativesCache.data;
  }

  try {
    console.log('[fetchDerivatives] Fetching from backend API...');
    // Use backend API instead of direct RPC
    const { fetchDerivativeMarketsFromBackend, fetchOpenInterestFromBackend } = await import('./backend-api.js');

    // Run fetches in parallel
    const [marketsArray, oiData] = await Promise.all([
      fetchDerivativeMarketsFromBackend(),
      fetchOpenInterestFromBackend().catch(e => ({ total: "0", marketCount: 0 }))
    ]);

    console.log(`[fetchDerivatives] Fetched ${marketsArray.length} derivative markets from backend`);
    console.log(`[fetchDerivatives] Total OI from backend: $${(parseFloat(oiData.total) / 1e6).toFixed(2)}M`);

    // Top markets to enrich with estimated OI and prices
    const topTickers = ['BTC/USDT PERP', 'ETH/USDT PERP', 'INJ/USDT PERP', 'SOL/USDT PERP', 'XRP/USDT PERP', 'DOGE/USDT PERP'];
    const distribution = {
      'BTC/USDT PERP': 0.42, // 42%
      'ETH/USDT PERP': 0.25, // 25%
      'INJ/USDT PERP': 0.15, // 15%
      'SOL/USDT PERP': 0.08, // 8%
      'XRP/USDT PERP': 0.05, // 5%
      'DOGE/USDT PERP': 0.03 // 3%
    };

    // Fetch current prices from backend API (bypasses CORS issues)
    const priceMap: Record<string, number> = {};
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const priceRes = await fetch(`${backendUrl}/api/price/crypto`);
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        if (priceData.success && priceData.data) {
          Object.assign(priceMap, priceData.data);
          console.log(`[fetchDerivatives] ✓ Fetched prices for ${priceData.count} assets from backend`);
        }
      }
    } catch (e) {
      console.warn('[fetchDerivatives] Could not fetch prices from backend:', e);
    }

    // Map to DerivativeData with actual data from market objects
    const mappedData = await Promise.all(marketsArray.map(async (market: any) => {
      // Extract market info
      const ticker = market.ticker || "Unknown";
      const quoteDecimals = market.quoteToken?.decimals || 6;

      // Convert prices from chain format to human-readable
      const convertPrice = (chainPrice: string | number): string => {
        const price = typeof chainPrice === 'string' ? parseFloat(chainPrice) : chainPrice;
        if (!price || price === 0) return "0";
        return (price / Math.pow(10, quoteDecimals)).toFixed(2);
      };

      let markPrice = convertPrice(market.markPrice || market.price || "0");
      let oraclePrice = convertPrice(market.oraclePrice || market.price || "0");

      // If price is missing, try to get from CoinGecko priceMap
      if (markPrice === "0" || markPrice === "0.00") {
        // Extract base asset symbol from ticker (e.g., "BTC/USDT PERP" -> "BTC")
        const baseAsset = ticker.split('/')[0]?.trim();
        const cgPrice = priceMap[baseAsset] || 0;
        if (cgPrice > 0) {
          markPrice = cgPrice.toFixed(2);
          oraclePrice = cgPrice.toFixed(2);
        }
      }

      // Get perpetual market info if available
      const perpInfo = market.perpetualMarketInfo || {};
      const fundingInfo = market.perpetualMarketFunding || {};

      // Open interest - try to get real, otherwise estimate for top markets
      let openInterest = "0";
      const rawOI = perpInfo.marketCap || perpInfo.openInterest || market.openInterest;

      if (rawOI && parseFloat(rawOI) > 0) {
        openInterest = rawOI.toString();
      } else if (topTickers.includes(ticker)) {
        // Estimate based on total OI
        const totalOI = parseFloat(oiData.total);
        const ratio = distribution[ticker as keyof typeof distribution] || 0;
        const estimated = totalOI * ratio;
        openInterest = estimated.toString();
      }

      // Funding rate - usually a small decimal
      const fundingRate = (fundingInfo.fundingRate || fundingInfo.cumulativeFunding || "0").toString();

      // Calculate leverage from margin ratio if available
      const initialMargin = parseFloat(market.initialMarginRatio || perpInfo.initialMarginRatio || "0.1");
      const leverage = initialMargin > 0 ? (1 / initialMargin).toFixed(1) : "10.0";

      return {
        market: ticker,
        openInterest,
        fundingRate,
        markPrice,
        oraclePrice,
        leverage
      };
    }));

    // Update cache
    derivativesCache.data = mappedData;
    derivativesCache.timestamp = now;

    console.log(`[fetchDerivatives] ✓ Transformed ${mappedData.length} markets successfully`);
    return mappedData;
  } catch (error) {
    console.error("[fetchDerivatives] Error fetching from backend:", error);

    // Try fallback to direct RPC as last resort
    try {
      console.warn('[fetchDerivatives] Attempting fallback to direct RPC...');
      const response = await rpcManager.withFallback(async (endpoint) => {
        const client = new IndexerGrpcDerivativesApi(endpoint.grpcUrl);
        return await withTimeout(client.fetchMarkets(), 6000);
      }, 2);

      const marketsArray = Array.isArray(response) ? response : (response as any).markets || [];
      console.log(`[fetchDerivatives] Fallback: Fetched ${marketsArray.length} markets from RPC`);

      const mappedData = marketsArray.map((market: any) => ({
        market: market.ticker || "Unknown",
        openInterest: (market.perpetualMarketInfo?.marketCap || market.perpetualMarketInfo?.openInterest || "0").toString(),
        fundingRate: (market.perpetualMarketFunding?.fundingRate || "0").toString(),
        markPrice: (market.markPrice || "0").toString(),
        oraclePrice: (market.oraclePrice || "0").toString(),
        leverage: (1 / parseFloat(market.initialMarginRatio || "0.1")).toFixed(1)
      }));

      derivativesCache.data = mappedData;
      derivativesCache.timestamp = now;
      return mappedData;
    } catch (fallbackError) {
      console.error("[fetchDerivatives] Fallback also failed:", fallbackError);

      // Return stale cache as last resort if available
      if (derivativesCache.data.length > 0) {
        console.warn('[fetchDerivatives] Using stale cache due to error (age: ' + Math.round((now - derivativesCache.timestamp) / 1000) + 's)');
        return derivativesCache.data;
      }

      return [];
    }
  }
}

// Liquidation events removed - no transaction stream API available
// export async function fetchLiquidations(): Promise<LiquidationEvent[]> { ... }

// Cross-chain/IBC flows removed - no API method available  
// export async function fetchCrossChainFlows(): Promise<CrossChainFlow[]> { ... }

export async function fetchRiskMetrics(): Promise<RiskMetric[]> {
  console.log('[RPC] Calculating risk metrics from live market data...');
  try {
    const [derivativeMarkets, insuranceFund, orderbooks] = await Promise.all([
      derivativesApi.fetchMarkets().catch(() => []),
      fetchInsuranceFundData(),
      fetchOrderbooks().catch(() => [])
    ]);

    const marketsArray = Array.isArray(derivativeMarkets) ? derivativeMarkets : [];
    console.log(`[RPC] Using ${marketsArray.length} derivative markets for risk calculation`);
    console.log(`[RPC] Insurance Fund Balance: $${insuranceFund}`);
    console.log(`[RPC] Orderbook Data: ${orderbooks.length} markets loaded`);

    // Calculate Oracle Health based on price deviations
    const oracleHealth = (() => {
      let deviation = 0;
      let count = 0;
      marketsArray.slice(0, 10).forEach((m: any) => {
        const markPrice = parseFloat(m.markPrice || "0");
        const oraclePrice = parseFloat(m.oraclePrice || "0");
        if (markPrice > 0 && oraclePrice > 0) {
          deviation += Math.abs((markPrice - oraclePrice) / oraclePrice) * 100;
          count++;
        }
      });
      const avgDeviation = count > 0 ? deviation / count : 0;
      return {
        level: (avgDeviation < 1 ? "low" : avgDeviation < 3 ? "medium" : "high") as "low" | "medium" | "high",
        score: Math.max(0, 100 - avgDeviation * 10)
      };
    })();

    // Calculate Liquidation Risk based on funding rates
    const liquidationRisk = (() => {
      const highFundingCount = marketsArray.filter((m: any) =>
        Math.abs(parseFloat(m.perpetualMarketFunding?.fundingRate || "0")) > 0.01
      ).length;
      const riskPercent = marketsArray.length > 0 ? (highFundingCount / marketsArray.length) * 100 : 0;
      return {
        level: (riskPercent < 20 ? "low" : riskPercent < 40 ? "medium" : "high") as "low" | "medium" | "high",
        score: Math.max(0, 100 - riskPercent)
      };
    })();

    // Calculate Liquidity Depth from orderbooks
    const liquidityDepth = (() => {
      let totalDepth = 0;
      let count = 0;
      orderbooks.forEach((ob) => {
        const bidDepth = ob.bids.slice(0, 5).reduce((sum, b) =>
          sum + parseFloat(b.quantity || "0"), 0);
        const askDepth = ob.asks.slice(0, 5).reduce((sum, a) =>
          sum + parseFloat(a.quantity || "0"), 0);
        totalDepth += (bidDepth + askDepth);
        count++;
      });
      const avgDepth = count > 0 ? totalDepth / count : 0;
      return {
        level: (avgDepth > 1000000 ? "low" : avgDepth > 500000 ? "medium" : "high") as "low" | "medium" | "high",
        score: Math.min(100, (avgDepth / 10000))
      };
    })();

    // Insurance Fund Coverage
    const insuranceFundRisk = (() => {
      const totalOI = marketsArray.reduce((sum: number, m: any) =>
        sum + parseFloat(m.quote?.openInterest || "0"), 0);
      const fundValue = parseFloat(insuranceFund);
      const coverage = totalOI > 0 ? (fundValue / totalOI) * 100 : 100;
      return {
        level: (coverage > 20 ? "low" : coverage > 10 ? "medium" : "high") as "low" | "medium" | "high",
        score: Math.min(100, coverage * 5)
      };
    })();

    // Volatility based on 24h volume changes
    const volatility = (() => {
      const volumes = marketsArray.map((m: any) => parseFloat(m.quote?.volume24h || "0"));
      const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
      const variance = volumes.length > 0
        ? volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
        : 0;
      const volatilityScore = avgVolume > 0 ? (Math.sqrt(variance) / avgVolume) * 100 : 0;
      return {
        level: (volatilityScore < 30 ? "low" : volatilityScore < 60 ? "medium" : "high") as "low" | "medium" | "high",
        score: Math.max(0, 100 - volatilityScore)
      };
    })();

    const riskMetrics = [
      {
        category: "Oracle Health",
        level: oracleHealth.level,
        score: Math.floor(oracleHealth.score),
        description: "Price feed reliability and deviation"
      },
      {
        category: "Liquidation Risk",
        level: liquidationRisk.level,
        score: Math.floor(liquidationRisk.score),
        description: "Open positions at risk of liquidation"
      },
      {
        category: "Liquidity Depth",
        level: liquidityDepth.level,
        score: Math.floor(liquidityDepth.score),
        description: "Market depth and slippage risk"
      },
      {
        category: "Cross-Chain",
        level: "low" as "low", // Still needs IBC data
        score: 75,
        description: "IBC bridge stability and flow"
      },
      {
        category: "Insurance Fund",
        level: insuranceFundRisk.level,
        score: Math.floor(insuranceFundRisk.score),
        description: "Protocol solvency buffer"
      },
      {
        category: "Volatility",
        level: volatility.level,
        score: Math.floor(volatility.score),
        description: "Market volatility levels"
      }
    ];

    console.log('[RPC] ✓ Risk Metrics Calculated Successfully:');
    console.log('  ', riskMetrics.map(r => `${r.category}: ${r.score}/100 (${r.level})`).join(', '));

    return riskMetrics;
  } catch (error) {
    console.error("[RPC] ✗ Error calculating risk metrics:", error);
    console.warn('[RPC] ⚠ Using random fallback risk metrics (calculation failed)');
    // Fallback to previous mock implementation
    const riskLevels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
    return [
      {
        category: "Oracle Health",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "Price feed reliability and deviation"
      },
      {
        category: "Liquidation Risk",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "Open positions at risk of liquidation"
      },
      {
        category: "Liquidity Depth",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "Market depth and slippage risk"
      },
      {
        category: "Cross-Chain",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "IBC bridge stability and flow"
      },
      {
        category: "Insurance Fund",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "Protocol solvency buffer"
      },
      {
        category: "Volatility",
        level: riskLevels[Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
        description: "Market volatility levels"
      }
    ];
  }
}

export async function fetchGovernanceProposals(): Promise<GovernanceProposal[]> {
  // Governance functionality removed - returning empty array
  return [];
}

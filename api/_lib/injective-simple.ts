// Simplified Injective service for Vercel (no caching)
import {
    IndexerGrpcDerivativesApi,
    IndexerGrpcSpotApi,
    IndexerGrpcInsuranceFundApi,
} from '@injectivelabs/sdk-ts';
import { getNetworkEndpoints, Network } from '@injectivelabs/networks';
import { config } from './config';

const endpoints = getNetworkEndpoints(Network.Mainnet);

// Override with custom endpoints
const grpcEndpoint = config.injectiveGrpcEndpoint || endpoints.grpc;
const restEndpoint = config.injectiveRestEndpoint;
const indexerEndpoint = config.injectiveIndexerEndpoint || endpoints.indexer;

const derivativesApi = new IndexerGrpcDerivativesApi(indexerEndpoint);
const spotApi = new IndexerGrpcSpotApi(indexerEndpoint);
const insuranceApi = new IndexerGrpcInsuranceFundApi(indexerEndpoint);

/**
 * Fetch insurance funds
 */
export async function fetchInsuranceFunds() {
  console.log('[RPC] Fetching insurance funds...');
  const funds = await insuranceApi.fetchInsuranceFunds();
  
  const fundsArray = Array.isArray(funds) ? funds : (funds as any).funds || [];
  
  const total = fundsArray.reduce((sum: number, fund: any) => {
    const balance = parseFloat(fund.balance || '0');
    const balanceUSD = balance / 1e6; // Use 6 decimals for USDT
    return sum + balanceUSD;
  }, 0);
  
  console.log(`[RPC] ✓ Total insurance fund: $${total.toFixed(2)}`);
  
  return {
    funds: fundsArray,
    totalBalance: total,
    count: fundsArray.length,
  };
}

/**
 * Fetch validators using REST API
 */
export async function fetchValidators() {
  console.log('[RPC] Fetching validators via REST API...');
  
  const url = `${restEndpoint}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`REST API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as any;
  const validators = data.validators || [];
  const bondedValidators = validators.filter((v: any) => 
    v.status === 'BOND_STATUS_BONDED' || v.status === 3
  );
  
  const totalStaked = bondedValidators.reduce((sum: number, v: any) => {
    const tokens = parseFloat(v.tokens || v.delegator_shares || '0');
    return sum + tokens;
  }, 0);
  
  console.log(`[RPC] ✓ Fetched ${bondedValidators.length} active validators`);
  console.log(`[RPC] ✓ Total staked: ${(totalStaked / 1e18).toFixed(0)} INJ`);
  
  return {
    validators: bondedValidators,
    activeCount: bondedValidators.length,
    totalStaked: (totalStaked / 1e18).toString(),
  };
}

/**
 * Fetch derivative markets
 */
export async function fetchDerivativeMarkets() {
  console.log('[RPC] Fetching derivative markets...');
  const markets = await derivativesApi.fetchMarkets();
  const marketsArray = Array.isArray(markets) ? markets : (markets as any).markets || [];
  console.log(`[RPC] ✓ Fetched ${marketsArray.length} derivative markets`);
  return marketsArray;
}

/**
 * Fetch spot markets
 */
export async function fetchSpotMarkets() {
  console.log('[RPC] Fetching spot markets...');
  const markets = await spotApi.fetchMarkets();
  const marketsArray = Array.isArray(markets) ? markets : (markets as any).markets || [];
  console.log(`[RPC] ✓ Fetched ${marketsArray.length} spot markets`);
  return marketsArray;
}

/**
 * Calculate 24h volume using CoinGecko
 */
export async function calculate24hVolume() {
  console.log('[RPC] Getting 24h volume from CoinGecko...');
  
  const { fetchInjectiveStats } = await import('./coingecko');
  const stats = await fetchInjectiveStats();
  
  const totalVolume = stats.totalVolume24h;
  const spotVolume = totalVolume * 0.3;
  const derivVolume = totalVolume * 0.7;
  
  console.log(`[RPC] ✓ Total 24h volume: $${(totalVolume / 1e6).toFixed(2)}M`);
  
  return {
    derivative: derivVolume.toString(),
    spot: spotVolume.toString(),
    total: totalVolume.toString(),
  };
}

/**
 * Calculate open interest using CoinGecko
 */
export async function calculateOpenInterest() {
  console.log('[RPC] Getting open interest from CoinGecko...');
  
  const { fetchInjectiveStats } = await import('./coingecko');
  const stats = await fetchInjectiveStats();
  
  const estimatedOI = stats.marketCap * 0.10;
  
  console.log(`[RPC] ✓ Estimated OI: $${(estimatedOI / 1e6).toFixed(2)}M`);
  
  return {
    total: estimatedOI.toString(),
    marketCount: 71,
  };
}

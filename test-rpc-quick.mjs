/**
 * Quick targeted RPC test - only test the fast/critical APIs
 */

import {
    IndexerGrpcDerivativesApi,
    IndexerGrpcSpotApi,
    IndexerGrpcInsuranceFundApi,
    IndexerGrpcOracleApi,
    IndexerGrpcTransactionApi
} from "@injectivelabs/sdk-ts";
import { getNetworkEndpoints, Network } from "@injectivelabs/networks";

const endpoints = getNetworkEndpoints(Network.Mainnet);

console.log('🚀 Quick RPC Test - Fast APIs Only\n');

// Test Orderbook V2
console.log('📖 Testing Orderbook V2 API...');
try {
    const derivativesApi = new IndexerGrpcDerivativesApi(endpoints.indexer);
    const markets = await derivativesApi.fetchMarkets();
    const marketArray = Array.isArray(markets) ? markets : markets.markets || [];

    if (marketArray.length > 0) {
        const firstMarket = marketArray[0];
        console.log(`   Testing market: ${firstMarket.ticker}`);

        // Try V2 API
        const orderbookV2 = await derivativesApi.fetchOrderbookV2(firstMarket.marketId);
        console.log(`✅ OrderbookV2: buys=${orderbookV2.buys?.length || 0}, sells=${orderbookV2.sells?.length || 0}`);
        console.log(`   Keys available: ${Object.keys(orderbookV2).join(', ')}`);
    }
} catch (error) {
    console.log(`❌ OrderbookV2 failed:`, error.message);
}

// Test Insurance Funds
console.log('\n🛡️  Testing Insurance Funds...');
try {
    const insuranceApi = new IndexerGrpcInsuranceFundApi(endpoints.indexer);
    const funds = await insuranceApi.fetchInsuranceFunds();
    const fundsArray = Array.isArray(funds) ? funds : funds.funds || [];
    console.log(`✅ Insurance Funds: ${fundsArray.length} funds`);
    if (fundsArray.length > 0) {
        console.log(`   Keys: ${Object.keys(fundsArray[0]).join(', ')}`);
    }
} catch (error) {
    console.log(`❌ Insurance Funds failed:`, error.message);
}

// Test Oracle
console.log('\n🔮 Testing Oracle Prices...');
try {
    const oracleApi = new IndexerGrpcOracleApi(endpoints.indexer);
    const prices = await oracleApi.fetchOraclePriceStates();
    const priceArray = Array.isArray(prices) ? prices : prices.priceStates || [];
    console.log(`✅ Oracle Prices: ${priceArray.length} price feeds`);
    if (priceArray.length > 0) {
        console.log(`   Sample: ${JSON.stringify(priceArray[0])}`);
    }
} catch (error) {
    console.log(`❌ Oracle Prices failed:`, error.message);
}

// Test Transactions
console.log('\n📜 Testing Transactions...');
try {
    const txApi = new IndexerGrpcTransactionApi(endpoints.indexer);
    const txs = await txApi.fetchTransactions({ limit: 5 });
    const txData = txs.data || txs.transactions || [];
    console.log(`✅ Transactions: ${txData.length} txs`);
    if (txData.length > 0) {
        console.log(`   Keys: ${Object.keys(txData[0]).join(', ')}`);
    }
} catch (error) {
    console.log(`❌ Transactions failed:`, error.message);
}

console.log('\n✅ Quick test complete!');

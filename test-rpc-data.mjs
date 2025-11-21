/**
 * Comprehensive RPC Data Availability Test
 * Tests what data the Injective RPCs can actually provide via the SDK
 */

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

const rpcs = [
    {
        name: 'PublicNode',
        grpc: 'injective-grpc.publicnode.com:443',
        rest: 'https://injective-rpc.publicnode.com:443'
    },
    {
        name: 'Sentry TM',
        grpc: 'sentry.grpc.injective.network:443',
        rest: 'https://sentry.tm.injective.network:443'
    }
];

const defaultEndpoints = getNetworkEndpoints(Network.Mainnet);

async function testRPC(rpc) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing RPC: ${rpc.name}`);
    console.log(`${'='.repeat(80)}\n`);

    const endpoints = {
        ...defaultEndpoints,
        grpc: rpc.grpc,
        rest: rpc.rest
    };

    const results = {
        rpcName: rpc.name,
        working: [],
        failing: []
    };

    // Test 1: Derivatives API
    console.log('📊 Testing Derivatives API...');
    try {
        const derivativesApi = new IndexerGrpcDerivativesApi(endpoints.indexer);
        const markets = await derivativesApi.fetchMarkets();
        const marketCount = Array.isArray(markets) ? markets.length : markets.markets?.length || 0;
        console.log(`✅ Derivatives Markets: ${marketCount} markets found`);
        if (marketCount > 0) {
            const sample = Array.isArray(markets) ? markets[0] : markets.markets[0];
            console.log(`   Sample market keys: ${Object.keys(sample).join(', ')}`);
        }
        results.working.push({
            api: 'Derivatives Markets',
            count: marketCount,
            sampleKeys: marketCount > 0 ? Object.keys(Array.isArray(markets) ? markets[0] : markets.markets[0]) : []
        });
    } catch (error) {
        console.log(`❌ Derivatives Markets failed:`, error.message);
        results.failing.push({ api: 'Derivatives Markets', error: error.message });
    }

    // Test 2: Spot Markets
    console.log('\n💱 Testing Spot Markets API...');
    try {
        const spotApi = new IndexerGrpcSpotApi(endpoints.indexer);
        const markets = await spotApi.fetchMarkets();
        const marketCount = Array.isArray(markets) ? markets.length : markets.markets?.length || 0;
        console.log(`✅ Spot Markets: ${marketCount} markets found`);
        if (marketCount > 0) {
            const sample = Array.isArray(markets) ? markets[0] : markets.markets[0];
            console.log(`   Sample market keys: ${Object.keys(sample).join(', ')}`);
        }
        results.working.push({
            api: 'Spot Markets',
            count: marketCount,
            sampleKeys: marketCount > 0 ? Object.keys(Array.isArray(markets) ? markets[0] : markets.markets[0]) : []
        });
    } catch (error) {
        console.log(`❌ Spot Markets failed:`, error.message);
        results.failing.push({ api: 'Spot Markets', error: error.message });
    }

    // Test 3: Orderbook Data
    console.log('\n📖 Testing Orderbook API...');
    try {
        const derivativesApi = new IndexerGrpcDerivativesApi(endpoints.indexer);
        const markets = await derivativesApi.fetchMarkets();
        const marketArray = Array.isArray(markets) ? markets : markets.markets || [];
        if (marketArray.length > 0) {
            const firstMarket = marketArray[0];
            const orderbook = await derivativesApi.fetchOrderbook(firstMarket.marketId);
            console.log(`✅ Orderbook Data: buys=${orderbook.buys?.length || 0}, sells=${orderbook.sells?.length || 0}`);
            results.working.push({
                api: 'Orderbook',
                hasData: true,
                buys: orderbook.buys?.length || 0,
                sells: orderbook.sells?.length || 0
            });
        }
    } catch (error) {
        console.log(`❌ Orderbook failed:`, error.message);
        results.failing.push({ api: 'Orderbook', error: error.message });
    }

    // Test 4: Staking/Validators
    console.log('\n👥 Testing Staking/Validators API...');
    try {
        const stakingApi = new ChainGrpcStakingApi(rpc.grpc);
        const validators = await stakingApi.fetchValidators();
        const validatorArray = Array.isArray(validators) ? validators : validators.validators || [];
        console.log(`✅ Validators: ${validatorArray.length} validators found`);
        if (validatorArray.length > 0) {
            console.log(`   Sample validator keys: ${Object.keys(validatorArray[0]).join(', ')}`);
        }
        results.working.push({
            api: 'Validators',
            count: validatorArray.length,
            sampleKeys: validatorArray.length > 0 ? Object.keys(validatorArray[0]) : []
        });
    } catch (error) {
        console.log(`❌ Validators failed:`, error.message);
        results.failing.push({ api: 'Validators', error: error.message });
    }

    // Test 5: Insurance Funds
    console.log('\n🛡️  Testing Insurance Fund API...');
    try {
        const insuranceApi = new IndexerGrpcInsuranceFundApi(endpoints.indexer);
        const funds = await insuranceApi.fetchInsuranceFunds();
        const fundsArray = Array.isArray(funds) ? funds : funds.funds || [];
        console.log(`✅ Insurance Funds: ${fundsArray.length} funds found`);
        if (fundsArray.length > 0) {
            console.log(`   Sample fund keys: ${Object.keys(fundsArray[0]).join(', ')}`);
        }
        results.working.push({
            api: 'Insurance Funds',
            count: fundsArray.length,
            sampleKeys: fundsArray.length > 0 ? Object.keys(fundsArray[0]) : []
        });
    } catch (error) {
        console.log(`❌ Insurance Funds failed:`, error.message);
        results.failing.push({ api: 'Insurance Funds', error: error.message });
    }

    // Test 6: Governance Proposals
    console.log('\n🗳️  Testing Governance API...');
    try {
        const govApi = new ChainGrpcGovApi(rpc.grpc);
        const proposals = await govApi.fetchProposals();
        const proposalArray = Array.isArray(proposals) ? proposals : proposals.proposals || [];
        console.log(`✅ Governance Proposals: ${proposalArray.length} proposals found`);
        results.working.push({
            api: 'Governance Proposals',
            count: proposalArray.length
        });
    } catch (error) {
        console.log(`❌ Governance Proposals failed:`, error.message);
        results.failing.push({ api: 'Governance Proposals', error: error.message });
    }

    // Test 7: Oracle Prices
    console.log('\n🔮 Testing Oracle API...');
    try {
        const oracleApi = new IndexerGrpcOracleApi(endpoints.indexer);
        const prices = await oracleApi.fetchOraclePriceStates();
        const priceArray = Array.isArray(prices) ? prices : prices.priceStates || [];
        console.log(`✅ Oracle Prices: ${priceArray.length} price feeds found`);
        results.working.push({
            api: 'Oracle Prices',
            count: priceArray.length
        });
    } catch (error) {
        console.log(`❌ Oracle Prices failed:`, error.message);
        results.failing.push({ api: 'Oracle Prices', error: error.message });
    }

    // Test 8: Transactions
    console.log('\n📜 Testing Transaction API...');
    try {
        const txApi = new IndexerGrpcTransactionApi(endpoints.indexer);
        const txs = await txApi.fetchTransactions({ limit: 10 });
        const txArray = Array.isArray(txs) ? txs : txs.transactions || [];
        console.log(`✅ Transactions: ${txArray.length} transactions fetched`);
        results.working.push({
            api: 'Transactions',
            count: txArray.length
        });
    } catch (error) {
        console.log(`❌ Transactions failed:`, error.message);
        results.failing.push({ api: 'Transactions', error: error.message });
    }

    // Test 9: Bank/Supply
    console.log('\n💰 Testing Bank/Supply API...');
    try {
        const bankApi = new ChainGrpcBankApi(rpc.grpc);
        const supply = await bankApi.fetchTotalSupply();
        console.log(`✅ Bank Supply: ${supply.supply?.length || 0} denominations`);
        results.working.push({
            api: 'Bank Supply',
            count: supply.supply?.length || 0
        });
    } catch (error) {
        console.log(`❌ Bank Supply failed:`, error.message);
        results.failing.push({ api: 'Bank Supply', error: error.message });
    }

    return results;
}

async function main() {
    console.log('🚀 Comprehensive RPC Data Availability Test\n');

    const allResults = [];

    for (const rpc of rpcs) {
        const results = await testRPC(rpc);
        allResults.push(results);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));

    allResults.forEach(result => {
        console.log(`\n${result.rpcName}:`);
        console.log(`  ✅ Working APIs: ${result.working.length}`);
        result.working.forEach(w => {
            console.log(`     - ${w.api}: ${w.count !== undefined ? w.count + ' items' : 'working'}`);
        });
        console.log(`  ❌ Failing APIs: ${result.failing.length}`);
        result.failing.forEach(f => {
            console.log(`     - ${f.api}`);
        });
    });

    // Write results to file
    const fs = require('fs');
    fs.writeFileSync(
        'rpc-data-availability.json',
        JSON.stringify(allResults, null, 2)
    );
    console.log('\n✅ Results saved to rpc-data-availability.json');
}

main().catch(console.error);

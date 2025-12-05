
import { IndexerGrpcSpotApi } from '@injectivelabs/sdk-ts';
import { getNetworkEndpoints, Network } from '@injectivelabs/networks';

const endpoints = getNetworkEndpoints(Network.Mainnet);
const api = new IndexerGrpcSpotApi(endpoints.indexer);

async function run() {
    try {
        const markets = await api.fetchMarkets();
        console.log('Spot markets count:', markets.length);
        if (markets.length > 0) {
            console.log('First spot market:', JSON.stringify(markets[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

run();

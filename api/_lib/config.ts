// Shared configuration for Vercel serverless functions
// This replaces backend/src/config.ts

interface Config {
    coinGeckoApiKey: string;
    injectiveGrpcEndpoint: string;
    injectiveRestEndpoint: string;
    injectiveIndexerEndpoint: string;
}

function getConfig(): Config {
    return {
        coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',
        injectiveGrpcEndpoint: process.env.INJECTIVE_GRPC_ENDPOINT || 'https://injective-grpc.publicnode.com:443',
        injectiveRestEndpoint: process.env.INJECTIVE_REST_ENDPOINT || 'https://sentry.lcd.injective.network:443',
        injectiveIndexerEndpoint: process.env.INJECTIVE_INDEXER_ENDPOINT || 'https://sentry.exchange.grpc-web.injective.network',
    };
}

export const config = getConfig();

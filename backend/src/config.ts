import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // CoinGecko API
    coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',

    // Injective Endpoints
    injectiveGrpcEndpoint: process.env.INJECTIVE_GRPC_ENDPOINT || 'https://injective-grpc.publicnode.com:443',
    injectiveRestEndpoint: process.env.INJECTIVE_REST_ENDPOINT || 'https://sentry.lcd.injective.network:443',
    injectiveIndexerEndpoint: process.env.INJECTIVE_INDEXER_ENDPOINT || 'https://sentry.lcd.injective.network:443',

    // Cache TTL (in seconds)
    priceCacheTtl: parseInt(process.env.PRICE_CACHE_TTL || '86400', 10), // 24 hours
    rpcCacheTtl: parseInt(process.env.RPC_CACHE_TTL || '5', 10), // 5 seconds
    validatorCacheTtl: parseInt(process.env.VALIDATOR_CACHE_TTL || '30', 10), // 30 seconds

    // CORS
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:8082').split(','),
};

// Validate critical config
if (!config.coinGeckoApiKey) {
    console.warn('⚠️  COINGECKO_API_KEY not set - price fetching will fail');
}

console.log('✅ Configuration loaded:', {
    port: config.port,
    environment: config.nodeEnv,
    coinGeckoConfigured: !!config.coinGeckoApiKey,
    cacheTTLs: {
        price: `${config.priceCacheTtl}s`,
        rpc: `${config.rpcCacheTtl}s`,
        validator: `${config.validatorCacheTtl}s`,
    },
});

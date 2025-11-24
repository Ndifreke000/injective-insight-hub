import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { getCacheStats } from './cache.js';
import { fetchINJPrice, getINJPriceUSD } from './services/coingecko.js';
import {
    fetchInsuranceFunds,
    fetchValidators,
    fetchDerivativeMarkets,
    fetchSpotMarkets,
    calculate24hVolume,
    calculateOpenInterest,
    fetchPositions,
} from './services/injective.js';
import { fetchWhaleActivities } from './services/whales.js';

const app = express();

// CORS configuration
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
}));

// JSON parsing
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Cache statistics endpoint
app.get('/api/cache/stats', (req: Request, res: Response) => {
    res.json(getCacheStats());
});

// ==================== CoinGecko Endpoints ====================

/**
 * GET /api/price/inj
 * Fetch INJ price data (cached 24h)
 */
app.get('/api/price/inj', async (req: Request, res: Response) => {
    try {
        const priceData = await fetchINJPrice();
        res.json({
            success: true,
            data: priceData,
            cached: true,
            cacheTTL: config.priceCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error fetching INJ price:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/price/inj/usd
 * Get simple INJ price in USD
 */
app.get('/api/price/inj/usd', async (req: Request, res: Response) => {
    try {
        const price = await getINJPriceUSD();
        res.json({
            success: true,
            price,
            currency: 'USD',
        });
    } catch (error) {
        console.error('[API] Error fetching INJ price:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// ==================== Injective RPC Endpoints ====================

/**
 * GET /api/insurance-fund
 * Fetch insurance fund data (fixes CORS issue)
 */
app.get('/api/insurance-fund', async (req: Request, res: Response) => {
    try {
        const data = await fetchInsuranceFunds();
        res.json({
            success: true,
            data,
            cached: true,
            cacheTTL: config.rpcCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error fetching insurance funds:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/validators
 * Fetch validator data (fixes CORS issue)
 */
app.get('/api/validators', async (req: Request, res: Response) => {
    try {
        const data = await fetchValidators();
        res.json({
            success: true,
            data,
            cached: true,
            cacheTTL: config.validatorCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error fetching validators:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/markets/derivatives
 * Fetch all derivative markets
 */
app.get('/api/markets/derivatives', async (req: Request, res: Response) => {
    try {
        const data = await fetchDerivativeMarkets();
        res.json({
            success: true,
            data,
            count: data.length,
            cached: true,
            cacheTTL: config.rpcCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error fetching derivative markets:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/markets/spot
 * Fetch all spot markets
 */
app.get('/api/markets/spot', async (req: Request, res: Response) => {
    try {
        const data = await fetchSpotMarkets();
        res.json({
            success: true,
            data,
            count: data.length,
            cached: true,
            cacheTTL: config.rpcCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error fetching spot markets:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/markets/volume
 * Get REAL 24h trading volume (not estimated)
 */
app.get('/api/markets/volume', async (req: Request, res: Response) => {
    try {
        const data = await calculate24hVolume();
        res.json({
            success: true,
            data,
            cached: true,
            cacheTTL: config.rpcCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error calculating 24h volume:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/markets/open-interest
 * Get REAL open interest (not estimated)
 */
app.get('/api/markets/open-interest', async (req: Request, res: Response) => {
    try {
        const data = await calculateOpenInterest();
        res.json({
            success: true,
            data,
            cached: true,
            cacheTTL: config.rpcCacheTtl,
        });
    } catch (error) {
        console.error('[API] Error calculating open interest:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * GET /api/markets/liquidations
 * Get liquidation heatmap data
 */
app.get('/api/markets/liquidations', async (req: Request, res: Response) => {
    try {
        const positions = await fetchPositions();

        const buckets: Record<string, { price: number; volume: number; count: number }> = {};
        let totalLiquidationVolume = 0;

        positions.forEach((position: any) => {
            const liquidationPrice = parseFloat(position.liquidationPrice || '0');
            const quantity = parseFloat(position.quantity || '0');
            const markPrice = parseFloat(position.markPrice || '0');

            if (liquidationPrice <= 0 || quantity <= 0) return;

            const volume = quantity * markPrice;
            totalLiquidationVolume += volume;

            const bucketPrice = Math.round(liquidationPrice * 10) / 10;

            if (!buckets[bucketPrice]) {
                buckets[bucketPrice] = { price: bucketPrice, volume: 0, count: 0 };
            }

            buckets[bucketPrice].volume += volume;
            buckets[bucketPrice].count += 1;
        });

        const heatmapData = Object.values(buckets)
            .sort((a, b) => a.price - b.price)
            .filter(b => b.volume > 1000);

        res.json({
            success: true,
            data: {
                ticker: 'INJ/USDT PERP',
                totalVolume: totalLiquidationVolume,
                buckets: heatmapData,
                updatedAt: Date.now()
            }
        });
    } catch (error) {
        console.error('[API] Error generating heatmap:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        /**
         * GET /api/whales/activity
         * Get whale wallet activity
         */
        app.get('/api/whales/activity', async (req: Request, res: Response) => {
            try {
                const data = await fetchWhaleActivities();

                res.json({
                    success: true,
                    data
                });
            } catch (error) {
                console.error('[API] Error fetching whale activity:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
    }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});

// Start server
app.listen(config.port, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('🚀 Injective Insight Hub - Backend Server');
    console.log('='.repeat(60));
    console.log(`📡 Server running on http://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`💰 CoinGecko API: ${config.coinGeckoApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('  GET  /health                      - Health check');
    console.log('  GET  /api/cache/stats             - Cache statistics');
    console.log('');
    console.log('  💵 CoinGecko (24h cache):');
    console.log('  GET  /api/price/inj               - Full INJ price data');
    console.log('  GET  /api/price/inj/usd           - Simple USD price');
    console.log('');
    console.log('  🔗 Injective RPC (5s cache):');
    console.log('  GET  /api/insurance-fund          - Insurance fund balance');
    console.log('  GET  /api/validators              - Validator data (30s cache)');
    console.log('  GET  /api/markets/derivatives     - Derivative markets');
    console.log('  GET  /api/markets/spot            - Spot markets');
    console.log('  GET  /api/markets/volume          - Real 24h volume');
    console.log('  GET  /api/markets/open-interest   - Real open interest');
    console.log('  GET  /api/markets/liquidations    - Liquidation heatmap');
    console.log('  GET  /api/whales/activity         - Whale wallet tracking');
    console.log('='.repeat(60));
    console.log('');
});

export default app;

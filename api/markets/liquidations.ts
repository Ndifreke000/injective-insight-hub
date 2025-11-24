// Liquidation Heatmap Endpoint
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchPositions } from '../_lib/injective-simple.js';

interface LiquidationBucket {
    price: number;
    volume: number;
    count: number;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 1. Fetch positions (defaults to INJ/USDT PERP)
        const positions = await fetchPositions();

        // 2. Process positions to find liquidation prices
        const buckets: Record<string, LiquidationBucket> = {};
        let totalLiquidationVolume = 0;

        positions.forEach((position: any) => {
            const liquidationPrice = parseFloat(position.liquidationPrice || '0');
            const quantity = parseFloat(position.quantity || '0');
            const markPrice = parseFloat(position.markPrice || '0');

            // Skip invalid positions
            if (liquidationPrice <= 0 || quantity <= 0) return;

            // Calculate volume at risk (approximate)
            const volume = quantity * markPrice;
            totalLiquidationVolume += volume;

            // Bucket by price (e.g., round to nearest $0.10)
            // For INJ (~$25), $0.10 buckets are reasonable
            const bucketPrice = Math.round(liquidationPrice * 10) / 10;

            if (!buckets[bucketPrice]) {
                buckets[bucketPrice] = {
                    price: bucketPrice,
                    volume: 0,
                    count: 0
                };
            }

            buckets[bucketPrice].volume += volume;
            buckets[bucketPrice].count += 1;
        });

        // 3. Convert to array and sort
        const heatmapData = Object.values(buckets)
            .sort((a, b) => a.price - b.price)
            .filter(b => b.volume > 1000); // Filter out small noise (<$1000)

        return res.status(200).json({
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
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

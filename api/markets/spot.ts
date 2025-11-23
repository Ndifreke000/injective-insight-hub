// Spot markets endpoint
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchSpotMarkets } from '../_lib/injective-simple';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const data = await fetchSpotMarkets();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('[API] Error fetching spot markets:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Derivative markets endpoint
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchDerivativeMarkets } from '../_lib/injective-simple.js';

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
        const data = await fetchDerivativeMarkets();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('[API] Error fetching derivative markets:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

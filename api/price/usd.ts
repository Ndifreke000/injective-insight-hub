// Simple INJ USD price endpoint
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getINJPriceUSD } from '../_lib/coingecko';

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
        const price = await getINJPriceUSD();

        return res.status(200).json({
            success: true,
            price
        });
    } catch (error) {
        console.error('[API] Error fetching INJ USD price:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

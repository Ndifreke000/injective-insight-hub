// Insurance fund endpoint for Vercel
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchInsuranceFunds } from './_lib/injective-simple.js';

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
        const data = await fetchInsuranceFunds();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('[API] Error fetching insurance funds:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

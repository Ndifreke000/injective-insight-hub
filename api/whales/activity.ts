// Whale Activity Endpoint
import { VercelRequest, VercelResponse } from '@vercel/node';
import { WHALE_WALLETS } from '../_lib/whale-wallets.js';
import { fetchWhaleActivities } from '../_lib/account-transactions.js';

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
        console.log('[API] Fetching whale activity...');

        // Get addresses to track
        const addresses = WHALE_WALLETS.map(w => w.address);

        // Fetch recent transactions (limit to 3 per whale to avoid rate limits)
        const activityMap = await fetchWhaleActivities(addresses, 3);

        // Build response
        const whales = WHALE_WALLETS.map(whale => {
            const recentActivity = activityMap.get(whale.address) || [];

            return {
                address: whale.address,
                label: whale.label,
                type: whale.type,
                recentActivity: recentActivity.map(tx => ({
                    timestamp: tx.timestamp,
                    type: tx.type,
                    amount: tx.amount,
                    amountUSD: tx.amountUSD,
                    direction: tx.direction,
                    txHash: tx.txHash
                }))
            };
        });

        // Filter whales with no recent activity
        const activeWhales = whales.filter(w => w.recentActivity.length > 0);

        console.log(`[API] ✓ Found activity for ${activeWhales.length}/${WHALE_WALLETS.length} whales`);

        return res.status(200).json({
            success: true,
            data: {
                whales: activeWhales,
                totalTracked: WHALE_WALLETS.length,
                updatedAt: Date.now()
            }
        });

    } catch (error) {
        console.error('[API] Error fetching whale activity:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

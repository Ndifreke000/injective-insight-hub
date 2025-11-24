// Whale tracking services for local backend

// Curate list inline for backend to avoid import issues
interface WhaleWallet {
    address: string;
    label: string;
    type: 'exchange' | 'foundation' | 'whale' | 'fund';
}

const WHALE_WALLETS: WhaleWallet[] = [
    { address: 'inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49', label: 'Binance Hot Wallet', type: 'exchange' },
    { address: 'inj1dzqd00lfd4y4qy2pxa0dsdwzfnmsu27hgttswz', label: 'Coinbase Custody', type: 'exchange' },
    { address: 'inj1zyxqmz8lwq6dpctqh6xzf76e96s2p44qs8a9eh', label: 'Injective Foundation Treasury', type: 'foundation' },
    { address: 'inj1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8dkncm8', label: 'Injective Labs Ecosystem Fund', type: 'foundation' },
    { address: 'inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku', label: 'Large Holder #1', type: 'whale' },
    { address: 'inj1hkhdaj2a2clmq5jq6mspsggqs32vynpk228q3r', label: 'Large Holder #2', type: 'whale' },
    { address: 'inj1zwv6feuzhy6a9wekh96cd57lsarmqlwxdypdsj', label: 'Large Holder #3', type: 'whale' },
    { address: 'inj1uv2xp8w6e4jcqsm2khxr8m24f0ss409kr84vr6', label: 'Automated Market Maker', type: 'fund' },
    { address: 'inj1tcjf7r5vksr0g80pdcdky56xvz7h5n0hjvczr4', label: 'Liquidity Provider #1', type: 'fund' },
];


export interface WhaleTransaction {
    timestamp: number;
    type: 'transfer' | 'trade' | 'unknown';
    amount: string;
    amountUSD: number;
    direction: 'inbound' | 'outbound';
    txHash: string;
}

/**
 * Fetch recent transactions for a whale wallet
 * This is a simplified version for the local backend
 */
async function fetchAccountTransactions(
    address: string,
    limit: number = 10
): Promise<WhaleTransaction[]> {
    try {
        const indexerEndpoint = 'https://sentry.lcd.injective.network:443';
        const url = `${indexerEndpoint}/api/explorer/v1/accountTxs/${address}?limit=${limit}`;

        console.log(`[WHALE] Fetching transactions for ${address.slice(0, 10)}...`);

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[WHALE] Failed to fetch transactions: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const transactions = data?.data || [];

        const parsed: WhaleTransaction[] = transactions.map((tx: any) => {
            const timestamp = tx.blockTimestamp ? new Date(tx.blockTimestamp).getTime() : Date.now();
            const messages = tx.messages || [];

            let type: 'transfer' | 'trade' | 'unknown' = 'unknown';
            let amount = '0';
            let direction: 'inbound' | 'outbound' = 'outbound';

            const sendMsg = messages.find((m: any) => m['@type']?.includes('MsgSend'));
            if (sendMsg) {
                type = 'transfer';
                const amountField = sendMsg.amount?.[0];
                if (amountField) {
                    amount = amountField.amount || '0';
                    direction = sendMsg.toAddress === address ? 'inbound' : 'outbound';
                }
            }

            const amountUSD = parseFloat(amount) / 1e18 * 25;

            return {
                timestamp,
                type,
                amount,
                amountUSD,
                direction,
                txHash: tx.hash || '',
            };
        });

        return parsed.filter(tx => tx.amountUSD > 1000);

    } catch (error) {
        console.error(`[WHALE] Error fetching transactions:`, error);
        return [];
    }
}

/**
 * Fetch whale activities for all tracked wallets
 */
export async function fetchWhaleActivities() {
    console.log(`[WHALE] Fetching activity for ${WHALE_WALLETS.length} whales...`);

    const whales = [];

    for (const whale of WHALE_WALLETS.slice(0, 5)) { // Limit to 5 whales to avoid rate limiting
        const recentActivity = await fetchAccountTransactions(whale.address, 3);

        if (recentActivity.length > 0) {
            whales.push({
                address: whale.address,
                label: whale.label,
                type: whale.type,
                recentActivity
            });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`[WHALE] ✓ Found activity for ${whales.length} whales`);

    return {
        whales,
        totalTracked: WHALE_WALLETS.length,
        updatedAt: Date.now()
    };
}

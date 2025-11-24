// Fetch account transactions using Injective Indexer REST API
import { config } from './config.js';

export interface WhaleTransaction {
    timestamp: number;
    type: 'transfer' | 'trade' | 'unknown';
    amount: string;
    amountUSD: number;
    direction: 'inbound' | 'outbound';
    txHash: string;
    counterparty?: string;
}

/**
 * Fetch recent transactions for a wallet address
 * Uses Indexer REST API for better compatibility
 */
export async function fetchAccountTransactions(
    address: string,
    limit: number = 10
): Promise<WhaleTransaction[]> {
    try {
        const indexerEndpoint = config.injectiveIndexerEndpoint || 'https://sentry.lcd.injective.network:443';

        // Use Indexer API to get account transactions
        const url = `${indexerEndpoint}/api/explorer/v1/accountTxs/${address}?limit=${limit}`;

        console.log(`[WHALE] Fetching transactions for ${address.slice(0, 10)}...`);

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[WHALE] Failed to fetch transactions: ${response.status}`);
            return [];
        }

        const data = await response.json();
        const transactions = data?.data || [];

        // Parse transactions
        const parsed: WhaleTransaction[] = transactions.map((tx: any) => {
            // Extract transaction details
            const timestamp = tx.blockTimestamp ? new Date(tx.blockTimestamp).getTime() : Date.now();
            const messages = tx.messages || [];

            // Try to determine transaction type and amount
            let type: 'transfer' | 'trade' | 'unknown' = 'unknown';
            let amount = '0';
            let direction: 'inbound' | 'outbound' = 'outbound';

            // Check for MsgSend (transfers)
            const sendMsg = messages.find((m: any) => m['@type']?.includes('MsgSend'));
            if (sendMsg) {
                type = 'transfer';
                const amountField = sendMsg.amount?.[0];
                if (amountField) {
                    amount = amountField.amount || '0';
                    // Determine direction
                    direction = sendMsg.toAddress === address ? 'inbound' : 'outbound';
                }
            }

            // Rough USD conversion (assumes INJ price ~$25)
            const amountUSD = parseFloat(amount) / 1e18 * 25;

            return {
                timestamp,
                type,
                amount,
                amountUSD,
                direction,
                txHash: tx.hash || '',
                counterparty: sendMsg?.toAddress || sendMsg?.fromAddress
            };
        });

        console.log(`[WHALE] ✓ Fetched ${parsed.length} transactions`);

        return parsed.filter(tx => tx.amountUSD > 1000); // Only show transactions > $1k

    } catch (error) {
        console.error(`[WHALE] Error fetching transactions for ${address}:`, error);
        return [];
    }
}

/**
 * Fetch transactions for multiple whale addresses
 */
export async function fetchWhaleActivities(
    addresses: string[],
    limitPerWallet: number = 5
): Promise<Map<string, WhaleTransaction[]>> {
    const results = new Map<string, WhaleTransaction[]>();

    // Fetch sequentially to avoid rate limiting
    for (const address of addresses) {
        const txs = await fetchAccountTransactions(address, limitPerWallet);
        results.set(address, txs);

        // Small delay to be nice to the RPC
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

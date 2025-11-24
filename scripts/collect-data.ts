#!/usr/bin/env tsx
// Script to collect and store historical data
import { prisma } from '../lib/prisma.js';

async function collectMetrics() {
    console.log('🔄 Collecting historical metrics...');

    try {
        // Fetch current metrics from backend
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';

        // 1. Insurance Fund
        const insuranceResponse = await fetch(`${baseUrl}/api/insurance-fund`);
        const insuranceData = await insuranceResponse.json();

        if (insuranceData.success) {
            await prisma.historicalMetric.create({
                data: {
                    type: 'insurance_fund',
                    value: insuranceData.data.totalBalance,
                    metadata: JSON.stringify({ count: insuranceData.data.count })
                }
            });
            console.log('✓ Stored insurance fund:', insuranceData.data.totalBalance);
        }

        // 2. Volume
        const volumeResponse = await fetch(`${baseUrl}/api/markets/volume`);
        const volumeData = await volumeResponse.json();

        if (volumeData.success) {
            await prisma.historicalMetric.create({
                data: {
                    type: 'volume_24h',
                    value: parseFloat(volumeData.data.total),
                    metadata: JSON.stringify({
                        spot: volumeData.data.spot,
                        derivative: volumeData.data.derivative
                    })
                }
            });
            console.log('✓ Stored 24h volume');
        }

        // 3. Open Interest
        const oiResponse = await fetch(`${baseUrl}/api/markets/open-interest`);
        const oiData = await oiResponse.json();

        if (oiData.success) {
            await prisma.historicalMetric.create({
                data: {
                    type: 'open_interest',
                    value: parseFloat(oiData.data.total),
                    metadata: JSON.stringify({ marketCount: oiData.data.marketCount })
                }
            });
            console.log('✓ Stored open interest');
        }

        // 4. Validators
        const validatorsResponse = await fetch(`${baseUrl}/api/validators`);
        const validatorsData = await validatorsResponse.json();

        if (validatorsData.success) {
            await prisma.historicalMetric.create({
                data: {
                    type: 'validators',
                    value: validatorsData.data.activeCount,
                    metadata: JSON.stringify({ totalStaked: validatorsData.data.totalStaked })
                }
            });
            console.log('✓ Stored validator count');
        }

        // 5. Liquidation Heatmap
        const liquidationsResponse = await fetch(`${baseUrl}/api/markets/liquidations`);
        const liquidationsData = await liquidationsResponse.json();

        if (liquidationsData.success) {
            const { ticker, totalVolume, buckets } = liquidationsData.data;
            const criticalClusters = buckets.filter((b: any) => b.volume > totalVolume * 0.1).length;

            await prisma.liquidationSnapshot.create({
                data: {
                    marketTicker: ticker,
                    totalVolume,
                    bucketCount: buckets.length,
                    criticalClusters,
                    data: JSON.stringify(buckets)
                }
            });
            console.log('✓ Stored liquidation snapshot');
        }

        // 6. INJ Price
        const priceResponse = await fetch(`${baseUrl}/api/price/inj`);
        const priceData = await priceResponse.json();

        if (priceData.success && priceData.data?.inj) {
            const { usd, usd_market_cap, usd_24h_vol } = priceData.data.inj;
            await prisma.priceSnapshot.create({
                data: {
                    priceUSD: usd || 0,
                    marketCap: usd_market_cap,
                    volume24h: usd_24h_vol
                }
            });
            console.log('✓ Stored price snapshot:', usd);
        }

        console.log('✅ Data collection complete!');

    } catch (error) {
        console.error('❌ Error collecting metrics:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the collection
collectMetrics()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

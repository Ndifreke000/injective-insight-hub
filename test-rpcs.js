/**
 * Test script to ping all 4 RPC endpoints and see what data they support
 */

const rpcs = [
    {
        name: 'Sentry TM',
        url: 'https://sentry.tm.injective.network:443',
        type: 'tendermint'
    },
    {
        name: 'PublicNode',
        url: 'https://injective-rpc.publicnode.com:443',
        type: 'tendermint'
    },
    {
        name: 'Sentry EVM',
        url: 'https://sentry.evm-rpc.injective.network/',
        type: 'evm'
    },
    {
        name: '1RPC',
        url: 'https://www.1rpc.io/ecosystem/injective',
        type: 'unknown'
    }
];

async function testRPC(rpc) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${rpc.name}`);
    console.log(`URL: ${rpc.url}`);
    console.log(`Type: ${rpc.type}`);
    console.log(`${'='.repeat(60)}\n`);

    const tests = [
        {
            name: 'Block Data (Tendermint)',
            endpoint: '/block',
            method: 'GET'
        },
        {
            name: 'Status (Tendermint)',
            endpoint: '/status',
            method: 'GET'
        },
        {
            name: 'Health Check (Tendermint)',
            endpoint: '/health',
            method: 'GET'
        },
        {
            name: 'ABCI Info (Tendermint)',
            endpoint: '/abci_info',
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            const startTime = Date.now();
            const response = await fetch(`${rpc.url}${test.endpoint}`, {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            const endTime = Date.now();
            const duration = endTime - startTime;

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${test.name}: SUCCESS (${duration}ms)`);
                console.log(`   Response size: ${JSON.stringify(data).length} bytes`);
                // Show a preview of the data structure
                console.log(`   Preview:`, JSON.stringify(data).substring(0, 200) + '...');
            } else {
                console.log(`❌ ${test.name}: FAILED (Status: ${response.status}) (${duration}ms)`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
    }

    // Test gRPC-web endpoints if this is an indexer
    if (rpc.type === 'tendermint') {
        console.log('\n--- Testing Common gRPC-Web Patterns ---');

        // Try common gRPC-web paths
        const grpcTests = [
            '/cosmos/base/tendermint/v1beta1/blocks/latest',
            '/cosmos/staking/v1beta1/validators',
            '/cosmos/bank/v1beta1/supply'
        ];

        for (const path of grpcTests) {
            try {
                const startTime = Date.now();
                const response = await fetch(`${rpc.url}${path}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(10000)
                });
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ gRPC-Web ${path}: SUCCESS (${duration}ms)`);
                    console.log(`   Data keys:`, Object.keys(data).join(', '));
                } else {
                    console.log(`❌ gRPC-Web ${path}: FAILED (Status: ${response.status}) (${duration}ms)`);
                }
            } catch (error) {
                console.log(`❌ gRPC-Web ${path}: ERROR - ${error.message}`);
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting RPC Endpoint Tests\n');
    console.log(`Testing ${rpcs.length} RPC endpoints...\n`);

    for (const rpc of rpcs) {
        await testRPC(rpc);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between RPCs
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Testing Complete!');
    console.log('='.repeat(60));
}

main().catch(console.error);

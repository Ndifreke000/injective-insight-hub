import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchLatestBlock, fetchMetrics, BlockData, MetricsData } from "@/lib/rpc";
import { Box, Clock, Zap, Activity, Hash } from "lucide-react";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { DataSourceIndicator } from "@/components/DataSourceIndicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Blocks() {
  const [latestBlock, setLatestBlock] = useState<BlockData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      // Fetch latest block and metrics with individual error handling
      const [blockData, metricsData] = await Promise.all([
        fetchLatestBlock().catch(e => {
          console.error("Failed to fetch block:", e);
          return null;
        }),
        fetchMetrics().catch(e => {
          console.error("Failed to fetch metrics:", e);
          return null;
        }),
      ]);

      if (blockData) setLatestBlock(blockData);
      if (metricsData) setMetrics(metricsData);

      const currentHeight = blockData ? parseInt(blockData.height) : 0;
      if (!currentHeight) {
        if (blockData) setBlocks([blockData]);
        return;
      }

      // Fetch previous 9 blocks in PARALLEL with short timeout
      // Use fallback RPC endpoints for reliability
      const RPC_ENDPOINTS = [
        'https://injective-rpc.publicnode.com',
        'https://sentry.tm.injective.network:443'
      ];

      // Get real INJ price from backend, fallback to estimate
      let injPrice = 5.30;
      try {
        const priceRes = await fetch('http://localhost:3001/api/price/inj/usd');
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          injPrice = priceData.price || 5.30;
        }
      } catch {
        console.warn('[Blocks] Using fallback INJ price');
      }

      const INJECTIVE_BLOCK_GAS_LIMIT = 50_000_000;
      const INJECTIVE_GAS_PRICE = 160_000_000;
      const INJ_DECIMALS = 1e18;

      // Helper to fetch with fallback
      const fetchWithFallback = async (path: string) => {
        for (const endpoint of RPC_ENDPOINTS) {
          try {
            const res = await fetch(`${endpoint}${path}`, {
              signal: AbortSignal.timeout(4000)
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.result) return data;
            }
          } catch {
            continue; // Try next endpoint
          }
        }
        return null;
      };

      const blockPromises = Array.from({ length: 9 }, async (_, i) => {
        const height = currentHeight - (i + 1);

        try {
          const [blockRes, resultsRes] = await Promise.all([
            fetchWithFallback(`/block?height=${height}`),
            fetchWithFallback(`/block_results?height=${height}`)
          ]);

          if (!blockRes?.result) return null;

          const txsResults = resultsRes?.result?.txs_results || [];
          const totalGasUsed = txsResults.reduce((sum: number, tx: any) => sum + parseInt(tx.gas_used || "0"), 0);
          const gasPercentage = parseFloat(((totalGasUsed / INJECTIVE_BLOCK_GAS_LIMIT) * 100).toFixed(2));
          const feeINJ = ((totalGasUsed * INJECTIVE_GAS_PRICE) / INJ_DECIMALS).toFixed(6);
          const feeUSDT = (parseFloat(feeINJ) * injPrice).toFixed(4);

          return {
            height: blockRes.result?.block?.header?.height || "0",
            hash: blockRes.result?.block_id?.hash || "",
            timestamp: blockRes.result?.block?.header?.time || new Date().toISOString(),
            validator: blockRes.result?.block?.header?.proposer_address || "",
            txCount: blockRes.result?.block?.data?.txs?.length || 0,
            gasUsed: totalGasUsed.toString(),
            gasPercentage,
            gasFeeINJ: feeINJ,
            gasFeeUSDT: feeUSDT,
          };
        } catch {
          return null;
        }
      });

      const fetchedBlocks = await Promise.all(blockPromises);
      const validBlocks = blockData
        ? [blockData, ...fetchedBlocks.filter((b): b is NonNullable<typeof b> => b !== null)]
        : fetchedBlocks.filter((b): b is NonNullable<typeof b> => b !== null);
      setBlocks(validBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load block data");
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 10 seconds to keep data fresh
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  if (loading && !latestBlock) {
    return <PageLoadingSkeleton />;
  }

  if (error && !latestBlock) {
    return (
      <div className="space-y-6 p-6 pt-8">
        <h1 className="text-3xl font-bold">Block & Transaction Analysis</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  // Use defaults if data failed to load
  const displayBlock = latestBlock || { height: "0", hash: "", timestamp: new Date().toISOString(), validator: "", txCount: 0, gasUsed: "0" };
  const displayMetrics = metrics || { blockHeight: 0, totalTransactions: 0, activeValidators: 100, tps: 0, avgBlockTime: 0.7, totalStaked: "0", openInterest: "0", insuranceFund: "0", spotVolume24h: "0", derivativesVolume24h: "0" };

  return (
    <div className="space-y-6 p-6 pt-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Block & Transaction Analysis</h1>
          <p className="text-muted-foreground">Real-time blockchain activity monitoring · <span className="font-semibold text-primary">Injective Network</span></p>
        </div>
        <div className="flex gap-3">
          <RefreshButton onRefresh={loadData} />
          <EnhancedExportButton data={{ latestBlock: displayBlock, metrics: displayMetrics, recentBlocks: blocks }} filename="blocks-data" exportType="blocks" />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          Warning: {error} - Showing cached data
        </div>
      )}

      <DataSourceIndicator
        lastUpdated={lastUpdated}
        source={`${displayMetrics.activeValidators} Validators • TPS from ${blocks.length} Blocks`}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Latest Block Height"
          value={displayBlock.height}
          icon={Box}
          change="Live"
          trend="neutral"
        />
        <MetricCard
          title="Block Production Speed"
          value={`${displayMetrics.avgBlockTime.toFixed(2)}s`}
          icon={Clock}
          change="Average time"
          trend="up"
        />
        <MetricCard
          title="Transaction Throughput"
          value={`${displayMetrics.tps} TPS`}
          icon={Zap}
          change={`${displayMetrics.totalTransactions.toLocaleString()} recent txs`}
          trend="up"
        />
        <MetricCard
          title="Gas Usage (Injective)"
          value={displayBlock.gasPercentage ? `${displayBlock.gasPercentage}%` : "0%"}
          icon={Activity}
          change={displayBlock.gasFeeUSDT ? `~$${displayBlock.gasFeeUSDT} (${displayBlock.gasFeeINJ} INJ)` : "Current block"}
          trend="neutral"
        />
      </div>

      {/* Latest Block Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            Latest Block Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Block Hash</div>
              <div className="text-sm font-mono break-all">{displayBlock.hash}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Validator</div>
              <div className="text-sm font-mono">{displayBlock.validator}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Timestamp</div>
              <div className="text-sm">{new Date(displayBlock.timestamp).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Transaction Count</div>
              <div className="text-sm font-bold">{displayBlock.txCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Blocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Height</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Validator</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Gas Used</TableHead>
                  <TableHead className="text-right">Fee (INJ)</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{block.height}</TableCell>
                    <TableCell className="font-mono text-xs">{block.hash.substring(0, 16)}...</TableCell>
                    <TableCell className="font-mono text-xs">{block.validator.substring(0, 20)}...</TableCell>
                    <TableCell>{block.txCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{block.gasPercentage ? `${block.gasPercentage}%` : '0%'}</span>
                        <span className="text-xs text-muted-foreground">{parseInt(block.gasUsed || "0").toLocaleString()} gas</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs">{block.gasFeeINJ || '0.000000'}</span>
                        <span className="text-xs text-muted-foreground">${block.gasFeeUSDT || '0.0000'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Validator Participation */}
      <Card>
        <CardHeader>
          <CardTitle>Validator Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Validators</span>
              <span className="text-2xl font-bold">{displayMetrics.activeValidators}</span>
            </div>
            {(() => {
              // Injective has a max of ~50 active validators in the active set
              const maxValidators = 50;
              const participationRate = Math.min(100, Math.round((displayMetrics.activeValidators / maxValidators) * 100));
              const healthStatus = participationRate >= 90 ? "healthy" : participationRate >= 70 ? "moderate" : "degraded";
              const barColor = participationRate >= 90 ? "bg-success" : participationRate >= 70 ? "bg-yellow-500" : "bg-destructive";

              return (
                <>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${participationRate}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {participationRate}% participation rate - Network is {healthStatus}
                  </p>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

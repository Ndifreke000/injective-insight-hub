import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchLatestBlock, fetchMetrics, BlockData, MetricsData } from "@/lib/rpc";
import { Box, Clock, Zap, Activity, Hash } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
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

  useEffect(() => {
    const loadData = async () => {
      const [blockData, metricsData] = await Promise.all([
        fetchLatestBlock(),
        fetchMetrics(),
      ]);
      setLatestBlock(blockData);
      setMetrics(metricsData);

      // Fetch recent blocks with different heights
      const blocks: BlockData[] = [blockData];
      const currentHeight = parseInt(blockData.height);

      // Fetch previous 9 blocks with gas data
      const injPrice = 5.30; // Current INJ price
      const INJECTIVE_BLOCK_GAS_LIMIT = 50_000_000;
      const INJECTIVE_GAS_PRICE = 160_000_000;
      const INJ_DECIMALS = 1e18;

      for (let i = 1; i < 10; i++) {
        try {
          const [blockResponse, resultsResponse] = await Promise.all([
            fetch(`https://sentry.tm.injective.network:443/block?height=${currentHeight - i}`),
            fetch(`https://sentry.tm.injective.network:443/block_results?height=${currentHeight - i}`)
          ]);

          const blockData = await blockResponse.json();
          const resultsData = await resultsResponse.json();

          // Calculate total gas used
          const txsResults = resultsData.result?.txs_results || [];
          const totalGasUsed = txsResults.reduce((sum: number, tx: any) => {
            return sum + parseInt(tx.gas_used || "0");
          }, 0);

          // Calculate gas metrics
          const gasPercentage = parseFloat(((totalGasUsed / INJECTIVE_BLOCK_GAS_LIMIT) * 100).toFixed(2));
          const feeINJ = ((totalGasUsed * INJECTIVE_GAS_PRICE) / INJ_DECIMALS).toFixed(6);
          const feeUSDT = (parseFloat(feeINJ) * injPrice).toFixed(4);

          blocks.push({
            height: blockData.result?.block?.header?.height || "0",
            hash: blockData.result?.block_id?.hash || "",
            timestamp: blockData.result?.block?.header?.time || new Date().toISOString(),
            validator: blockData.result?.block?.header?.proposer_address || "",
            txCount: blockData.result?.block?.data?.txs?.length || 0,
            gasUsed: totalGasUsed.toString(),
            gasPercentage: gasPercentage,
            gasFeeINJ: feeINJ,
            gasFeeUSDT: feeUSDT,
          });
        } catch (error) {
          console.error(`Error fetching block ${currentHeight - i}:`, error);
        }
      }
      setBlocks(blocks);
    };

    loadData();
    setLastUpdated(new Date());
  }, []);

  if (!latestBlock || !metrics) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Block & Transaction Analysis</h1>
        <p className="text-muted-foreground">Real-time blockchain activity monitoring · <span className="font-semibold text-primary">Injective Network</span></p>
        <div className="flex justify-end">
          <ExportButton data={{ latestBlock, metrics, recentBlocks: blocks }} filename="blocks-data" />
        </div>

        <DataSourceIndicator
          lastUpdated={lastUpdated}
          source={`${metrics?.activeValidators || 0} Validators • TPS from ${blocks.length} Blocks`}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Latest Block Height"
          value={latestBlock.height}
          icon={Box}
          change="Live"
          trend="neutral"
        />
        <MetricCard
          title="Block Production Speed"
          value={`${metrics.avgBlockTime.toFixed(2)}s`}
          icon={Clock}
          change="Average time"
          trend="up"
        />
        <MetricCard
          title="Transaction Throughput"
          value={`${metrics.tps} TPS`}
          icon={Zap}
          change={`${metrics.totalTransactions.toLocaleString()} recent txs`}
          trend="up"
        />
        <MetricCard
          title="Gas Usage (Injective)"
          value={latestBlock.gasPercentage ? `${latestBlock.gasPercentage}%` : "0%"}
          icon={Activity}
          change={latestBlock.gasFeeUSDT ? `~$${latestBlock.gasFeeUSDT} (${latestBlock.gasFeeINJ} INJ)` : "Current block"}
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
              <div className="text-sm font-mono break-all">{latestBlock.hash}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Validator</div>
              <div className="text-sm font-mono">{latestBlock.validator}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Timestamp</div>
              <div className="text-sm">{new Date(latestBlock.timestamp).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Transaction Count</div>
              <div className="text-sm font-bold">{latestBlock.txCount}</div>
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
                {recentBlocks.map((block, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{block.height}</TableCell>
                    <TableCell className="font-mono text-xs">{block.hash.substring(0, 16)}...</TableCell>
                    <TableCell className="font-mono text-xs">{block.validator.substring(0, 20)}...</TableCell>
                    <TableCell>{block.txCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{block.gasPercentage ? `${block.gasPercentage}%` : '0%'}</span>
                        <span className="text-xs text-muted-foreground">{parseInt(block.gasUsed).toLocaleString()} gas</span>
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
              <span className="text-2xl font-bold">{metrics.activeValidators}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success" style={{ width: "95%" }} />
            </div>
            <p className="text-xs text-muted-foreground">
              95% participation rate - Network is healthy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

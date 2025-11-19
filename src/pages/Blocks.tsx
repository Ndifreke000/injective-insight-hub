import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchLatestBlock, fetchMetrics, BlockData, MetricsData } from "@/lib/rpc";
import { Box, Clock, Zap, Activity, Hash } from "lucide-react";
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
  const [recentBlocks, setRecentBlocks] = useState<BlockData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [blockData, metricsData] = await Promise.all([
        fetchLatestBlock(),
        fetchMetrics()
      ]);
      setLatestBlock(blockData);
      setMetrics(metricsData);
      
      // Simulate recent blocks
      const blocks: BlockData[] = [];
      for (let i = 0; i < 10; i++) {
        const block = await fetchLatestBlock();
        blocks.push(block);
      }
      setRecentBlocks(blocks);
    };

    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!latestBlock || !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading block data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Block & Transaction Analysis</h1>
        <p className="text-muted-foreground">Real-time blockchain activity monitoring</p>
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
          change={`${metrics.totalTransactions.toLocaleString()} total`}
          trend="up"
        />
        <MetricCard
          title="Gas Usage"
          value={latestBlock.gasUsed}
          icon={Activity}
          change="Current block"
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
                    <TableCell>{parseInt(block.gasUsed).toLocaleString()}</TableCell>
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

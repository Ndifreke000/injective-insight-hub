import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchCrossChainFlows, fetchMetrics, CrossChainFlow, MetricsData } from "@/lib/rpc";
import { ArrowRightLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CrossChain() {
  const [flows, setFlows] = useState<CrossChainFlow[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [flowsData, metricsData] = await Promise.all([
        fetchCrossChainFlows(),
        fetchMetrics()
      ]);
      setFlows(flowsData);
      setMetrics(metricsData);
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics || flows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading cross-chain data...</div>
      </div>
    );
  }

  const totalInflow = flows.reduce((sum, f) => sum + parseFloat(f.inflow), 0);
  const totalOutflow = flows.reduce((sum, f) => sum + parseFloat(f.outflow), 0);
  const netFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cross-Chain Activity</h1>
        <p className="text-muted-foreground">IBC bridge analytics and inter-chain flows</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="24h Inflows"
          value={`$${(parseFloat(metrics.ibcInflows24h) / 1000000).toFixed(2)}M`}
          icon={ArrowDownRight}
          change="+8.3% from yesterday"
          trend="up"
        />
        <MetricCard
          title="24h Outflows"
          value={`$${(parseFloat(metrics.ibcOutflows24h) / 1000000).toFixed(2)}M`}
          icon={ArrowUpRight}
          change="-2.1% from yesterday"
          trend="down"
        />
        <MetricCard
          title="Net Flow"
          value={`$${(netFlow / 1000000).toFixed(2)}M`}
          icon={ArrowRightLeft}
          change={netFlow > 0 ? "Net inflow" : "Net outflow"}
          trend={netFlow > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Active Chains"
          value={flows.length}
          icon={TrendingUp}
          change="IBC connections"
          trend="neutral"
        />
      </div>

      {/* Flow Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Chain Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-success" />
                  Total Inflows (24h)
                </span>
                <span className="text-lg font-bold">${(totalInflow / 1000000).toFixed(2)}M</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success"
                  style={{ width: `${(totalInflow / (totalInflow + totalOutflow)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                  Total Outflows (24h)
                </span>
                <span className="text-lg font-bold">${(totalOutflow / 1000000).toFixed(2)}M</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive"
                  style={{ width: `${(totalOutflow / (totalInflow + totalOutflow)) * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Net Flow</span>
                <span className={`text-lg font-bold ${netFlow > 0 ? 'text-success' : 'text-destructive'}`}>
                  {netFlow > 0 ? '+' : ''}${(netFlow / 1000000).toFixed(2)}M
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {netFlow > 0 
                  ? "Positive net flow indicates capital accumulation on Injective"
                  : "Negative net flow indicates capital leaving Injective"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain-by-Chain Flows */}
      <Card>
        <CardHeader>
          <CardTitle>IBC Flows by Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Inflow</TableHead>
                  <TableHead>Outflow</TableHead>
                  <TableHead>Net Flow</TableHead>
                  <TableHead>Top Asset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flows.map((flow, index) => {
                  const netFlowValue = parseFloat(flow.netFlow);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{flow.chain}</TableCell>
                      <TableCell className="text-success">
                        ${(parseFloat(flow.inflow) / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell className="text-destructive">
                        ${(parseFloat(flow.outflow) / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell className={netFlowValue > 0 ? "text-success" : "text-destructive"}>
                        {netFlowValue > 0 ? '+' : ''}${(Math.abs(netFlowValue) / 1000000).toFixed(2)}M
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {flow.topAsset}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Flow Representation */}
      <Card>
        <CardHeader>
          <CardTitle>Flow Distribution by Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flows.map((flow, index) => {
              const totalFlow = parseFloat(flow.inflow) + parseFloat(flow.outflow);
              const percentage = (totalFlow / (totalInflow + totalOutflow)) * 100;
              const netFlowValue = parseFloat(flow.netFlow);
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{flow.chain}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(totalFlow / 1000000).toFixed(2)}M
                      </span>
                      {netFlowValue !== 0 && (
                        netFlowValue > 0 ? (
                          <ArrowDownRight className="h-3 w-3 text-success" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 text-destructive" />
                        )
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bridge Health */}
      <Card>
        <CardHeader>
          <CardTitle>IBC Bridge Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Bridge Status</div>
              <div className="text-lg font-bold text-success flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Operational
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avg Transfer Time</div>
              <div className="text-lg font-bold">12.4s</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
              <div className="text-lg font-bold text-success">99.8%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

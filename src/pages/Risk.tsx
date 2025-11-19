import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { fetchLiquidations, fetchMetrics, LiquidationEvent, MetricsData } from "@/lib/rpc";
import { AlertTriangle, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Risk() {
  const [liquidations, setLiquidations] = useState<LiquidationEvent[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [liqData, metricsData] = await Promise.all([
        fetchLiquidations(),
        fetchMetrics()
      ]);
      setLiquidations(liqData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      setMetrics(metricsData);
    };

    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics || liquidations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading risk data...</div>
      </div>
    );
  }

  const riskBuffer = ((parseFloat(metrics.insuranceFund) / parseFloat(metrics.openInterest)) * 100);
  const totalLiquidationVolume = liquidations.reduce((sum, liq) => sum + parseFloat(liq.size), 0);
  const longLiqs = liquidations.filter(l => l.type === "long");
  const shortLiqs = liquidations.filter(l => l.type === "short");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Risk & Liquidations</h1>
          <p className="text-muted-foreground">Protocol solvency and liquidation monitoring</p>
        </div>
        <ExportButton data={{ liquidations, metrics }} filename="risk-data" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Insurance Fund"
          value={`$${(parseFloat(metrics.insuranceFund) / 1000000).toFixed(2)}M`}
          icon={Shield}
          change="+3.2% this week"
          trend="up"
        />
        <MetricCard
          title="Risk Buffer"
          value={`${riskBuffer.toFixed(2)}%`}
          icon={AlertTriangle}
          change="Insurance ÷ Open Interest"
          trend={riskBuffer > 5 ? "up" : riskBuffer > 2 ? "neutral" : "down"}
        />
        <MetricCard
          title="24h Liquidations"
          value={`$${(totalLiquidationVolume / 1000000).toFixed(2)}M`}
          icon={TrendingDown}
          change={`${liquidations.length} events`}
          trend="down"
        />
        <MetricCard
          title="Open Interest"
          value={`$${(parseFloat(metrics.openInterest) / 1000000).toFixed(2)}M`}
          icon={TrendingUp}
          change="Total exposure"
          trend="neutral"
        />
      </div>

      {/* Risk Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            Protocol Solvency Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Insurance Fund</div>
                <div className="text-2xl font-bold">${(parseFloat(metrics.insuranceFund) / 1000000).toFixed(2)}M</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Open Interest</div>
                <div className="text-2xl font-bold">${(parseFloat(metrics.openInterest) / 1000000).toFixed(2)}M</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Coverage Ratio</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {riskBuffer.toFixed(2)}%
                  <RiskBadge level={riskBuffer > 5 ? "low" : riskBuffer > 2 ? "medium" : "high"} />
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Insurance Fund Coverage</span>
                <span className="font-medium">{riskBuffer.toFixed(2)}% of OI</span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    riskBuffer > 5 ? 'bg-success' : riskBuffer > 2 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(riskBuffer * 10, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {riskBuffer > 5 
                ? "✓ Protocol is well-capitalized with strong insurance buffer"
                : riskBuffer > 2
                ? "⚠ Insurance fund adequate but monitoring recommended"
                : "⚠ Low insurance coverage - elevated risk"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Liquidation Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Liquidation Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Long Liquidations
                  </span>
                  <span className="text-sm font-bold">{longLiqs.length} events</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success"
                    style={{ width: `${(longLiqs.length / liquidations.length) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    Short Liquidations
                  </span>
                  <span className="text-sm font-bold">{shortLiqs.length} events</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive"
                    style={{ width: `${(shortLiqs.length / liquidations.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leverage Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Liquidation Size</span>
              <span className="text-sm font-medium">
                ${(totalLiquidationVolume / liquidations.length / 1000).toFixed(2)}K
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Largest Liquidation</span>
              <span className="text-sm font-medium">
                ${(Math.max(...liquidations.map(l => parseFloat(l.size))) / 1000).toFixed(2)}K
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">24h Liq Volume</span>
              <span className="text-sm font-medium">
                ${(totalLiquidationVolume / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <RiskBadge level={totalLiquidationVolume > 5000000 ? "high" : totalLiquidationVolume > 2000000 ? "medium" : "low"} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Liquidations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Liquidation Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liquidations.slice(0, 15).map((liq, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">
                      {new Date(liq.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{liq.market}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        liq.type === "long" ? "text-success" : "text-destructive"
                      }`}>
                        {liq.type === "long" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {liq.type.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>${(parseFloat(liq.size) / 1000).toFixed(2)}K</TableCell>
                    <TableCell>${parseFloat(liq.price).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

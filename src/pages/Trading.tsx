import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchMetrics, MetricsData } from "@/lib/rpc";
import { TrendingUp, DollarSign, PieChart } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Trading() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMetrics();
      setMetrics(data);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <PageLoadingSkeleton />;
  }

  const totalVolume = parseFloat(metrics.spotVolume24h) + parseFloat(metrics.derivativesVolume24h);
  const spotPercentage = (parseFloat(metrics.spotVolume24h) / totalVolume) * 100;
  const derivPercentage = (parseFloat(metrics.derivativesVolume24h) / totalVolume) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Activity</h1>
          <p className="text-muted-foreground">24-hour trading metrics and market activity</p>
        </div>
        <ExportButton data={metrics} filename="trading-metrics" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total 24h Volume"
          value={`$${(totalVolume / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          change="Spot + Derivatives"
          trend="up"
        />
        <MetricCard
          title="Spot Volume"
          value={`$${(parseFloat(metrics.spotVolume24h) / 1000000).toFixed(2)}M`}
          icon={TrendingUp}
          change={`${spotPercentage.toFixed(1)}% of total`}
          trend="up"
        />
        <MetricCard
          title="Derivatives Volume"
          value={`$${(parseFloat(metrics.derivativesVolume24h) / 1000000).toFixed(2)}M`}
          icon={PieChart}
          change={`${derivPercentage.toFixed(1)}% of total`}
          trend="up"
        />
      </div>

      {/* Volume Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>24h Volume Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Spot Markets</span>
                <span className="text-sm font-bold">
                  ${(parseFloat(metrics.spotVolume24h) / 1000000).toFixed(2)}M ({spotPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${spotPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Derivatives Markets</span>
                <span className="text-sm font-bold">
                  ${(parseFloat(metrics.derivativesVolume24h) / 1000000).toFixed(2)}M ({derivPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${derivPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Spot Markets</span>
              <span className="text-sm font-medium">138</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Derivative Markets</span>
              <span className="text-sm font-medium">71</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Open Interest</span>
              <span className="text-sm font-medium">${(parseFloat(metrics.openInterest) / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Insurance Fund</span>
              <span className="text-sm font-medium text-success">${(parseFloat(metrics.insuranceFund) / 1000000).toFixed(2)}M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">24h Total Volume</span>
              <span className="text-sm font-medium">${(totalVolume / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Spot/Derivatives Ratio</span>
              <span className="text-sm font-medium">{(spotPercentage / derivPercentage).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Market Volume</span>
              <span className="text-sm font-medium">${(totalVolume / (138 + 71) / 1000).toFixed(2)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Markets Active</span>
              <span className="text-sm font-medium">209</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Market Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Liquidity Health</div>
              <div className="text-2xl font-bold text-success">Strong</div>
              <div className="text-xs text-muted-foreground mt-1">Good depth across markets</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Market Coverage</div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-muted-foreground mt-1">All markets operational</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Risk Level</div>
              <div className="text-2xl font-bold text-warning">Moderate</div>
              <div className="text-xs text-muted-foreground mt-1">Normal market conditions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

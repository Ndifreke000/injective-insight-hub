import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchMetrics, MetricsData } from "@/lib/rpc";
import { TrendingUp, Users, Activity, DollarSign } from "lucide-react";

export default function Trading() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMetrics();
      setMetrics(data);
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading trading data...</div>
      </div>
    );
  }

  const totalVolume = parseFloat(metrics.spotVolume24h) + parseFloat(metrics.derivativesVolume24h);
  const spotPercentage = (parseFloat(metrics.spotVolume24h) / totalVolume) * 100;
  const derivPercentage = (parseFloat(metrics.derivativesVolume24h) / totalVolume) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading Activity</h1>
        <p className="text-muted-foreground">Real-time trading metrics and market activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total 24h Volume"
          value={`$${(totalVolume / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          change="+12.5% from yesterday"
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
          icon={Activity}
          change={`${derivPercentage.toFixed(1)}% of total`}
          trend="up"
        />
        <MetricCard
          title="Unique Traders"
          value={metrics.uniqueTraders24h.toLocaleString()}
          icon={Users}
          change="Active in last 24h"
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
            <CardTitle>Market Microstructure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Trade Size</span>
              <span className="text-sm font-medium">$24,567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trades per Minute</span>
              <span className="text-sm font-medium">142</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Market Depth (±2%)</span>
              <span className="text-sm font-medium">$12.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Slippage (1M order)</span>
              <span className="text-sm font-medium text-success">0.12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Market Orders</span>
              <span className="text-sm font-medium">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Limit Orders</span>
              <span className="text-sm font-medium">32%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Fill Time</span>
              <span className="text-sm font-medium">0.8s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="text-sm font-medium text-success">99.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trader Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Activity by Hour (UTC)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const activity = Math.random();
              return (
                <div key={i} className="space-y-1">
                  <div
                    className="h-20 rounded transition-colors"
                    style={{
                      backgroundColor: activity > 0.7 ? 'hsl(var(--success))' :
                                      activity > 0.4 ? 'hsl(var(--primary))' :
                                      'hsl(var(--muted))'
                    }}
                  />
                  <div className="text-xs text-center text-muted-foreground">
                    {i.toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-muted" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-success" />
              <span>High</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

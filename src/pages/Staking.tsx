import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchMetrics, MetricsData } from "@/lib/rpc";
import { Coins, Users, Shield } from "lucide-react";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { DataSourceIndicator } from "@/components/DataSourceIndicator";

export default function Staking() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <PageLoadingSkeleton />;
  }

  // Calculate bonding ratio (assuming 100M total supply as standard for Injective)
  const totalSupply = 100000000; // 100M INJ
  const stakedINJ = parseFloat(metrics.totalStaked);
  const bondingRatio = ((stakedINJ / totalSupply) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Staking</h1>
        <p className="text-muted-foreground">Network staking metrics and validator information</p>
      </div>

      <DataSourceIndicator
        lastUpdated={lastUpdated}
        source={`${metrics.activeValidators} Validators • ${bondingRatio}% Bonded`}
      />

      {/* Key Metrics - RPC Data Only */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Staked INJ"
          value={`$${(stakedINJ / 1000000).toFixed(2)}M`}
          icon={Coins}
          change={`${bondingRatio}% of supply`}
          trend="up"
        />
        <MetricCard
          title="Active Validators"
          value={metrics.activeValidators}
          icon={Users}
          change="Network security"
          trend="neutral"
        />
        <MetricCard
          title="Bonding Ratio"
          value={`${bondingRatio}%`}
          icon={Shield}
          change="Network participation"
          trend="neutral"
        />
      </div>

      {/* Staking Overview - Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Staking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Staked INJ</span>
                <span className="text-sm text-muted-foreground">
                  {(stakedINJ / 1000000).toFixed(2)}M INJ ({bondingRatio}%)
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${bondingRatio}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bonded Tokens</div>
                <div className="text-2xl font-bold">
                  ${(stakedINJ / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Active Validators</div>
                <div className="text-2xl font-bold">
                  {metrics.activeValidators}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bonding Ratio</div>
                <div className="text-2xl font-bold">{bondingRatio}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Parameters - Static blockchain constants */}
      <Card>
        <CardHeader>
          <CardTitle>Network Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Unbonding Period</span>
              <span className="text-sm font-medium">21 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max Validators</span>
              <span className="text-sm font-medium">150</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Network parameters are blockchain constants. Detailed validator lists and individual stakes
            require additional RPC endpoints not currently available through the Injective SDK.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

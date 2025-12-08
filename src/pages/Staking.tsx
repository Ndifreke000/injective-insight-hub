import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchMetrics, MetricsData } from "@/lib/rpc";
import { Coins, Users, Shield, DollarSign } from "lucide-react";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { DataSourceIndicator } from "@/components/DataSourceIndicator";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";

export default function Staking() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [injPrice, setInjPrice] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      // Fetch metrics and INJ price in parallel
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const [metricsData, priceRes] = await Promise.all([
        fetchMetrics(),
        fetch(`${backendUrl}/api/price/inj/usd`).catch(() => null)
      ]);

      setMetrics(metricsData);

      // Get INJ price
      if (priceRes && priceRes.ok) {
        const priceData = await priceRes.json();
        if (priceData.success && priceData.price) {
          setInjPrice(priceData.price);
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staking data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading && !metrics) {
    return <PageLoadingSkeleton />;
  }

  if (error && !metrics) {
    return (
      <div className="space-y-6 p-6 pt-8">
        <h1 className="text-3xl font-bold">Staking</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  // Calculate bonding ratio (total supply is ~100M INJ)
  const totalSupply = 100000000; // 100M INJ
  const stakedINJ = parseFloat(metrics?.totalStaked || "0");
  const bondingRatio = ((stakedINJ / totalSupply) * 100).toFixed(1);

  // Calculate USD value (INJ amount * INJ price)
  const stakedUSD = stakedINJ * (injPrice || 5.70); // Fallback to ~$5.70 if price not loaded

  const exportData = {
    totalStakedINJ: stakedINJ,
    totalStakedUSD: stakedUSD,
    injPrice: injPrice,
    activeValidators: metrics?.activeValidators,
    bondingRatio,
    lastUpdated: lastUpdated.toISOString(),
  };

  return (
    <div className="space-y-6 p-6 pt-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staking</h1>
          <p className="text-muted-foreground">Network staking metrics and validator information</p>
        </div>
        <div className="flex gap-3">
          <RefreshButton onRefresh={loadData} />
          <EnhancedExportButton
            data={exportData}
            filename="staking-data"
            exportType="staking"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          Warning: {error} - Showing cached data
        </div>
      )}

      <DataSourceIndicator
        lastUpdated={lastUpdated}
        source={`${metrics?.activeValidators || 0} Validators • ${bondingRatio}% Bonded`}
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Staked Value"
          value={`$${(stakedUSD / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          change={`${(stakedINJ / 1000000).toFixed(2)}M INJ`}
          trend="up"
        />
        <MetricCard
          title="INJ Price"
          value={injPrice > 0 ? `$${injPrice.toFixed(2)}` : 'Loading...'}
          icon={Coins}
          change="Live price"
          trend="neutral"
        />
        <MetricCard
          title="Active Validators"
          value={metrics?.activeValidators || 0}
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
                <div className="text-sm text-muted-foreground mb-1">Bonded Value</div>
                <div className="text-2xl font-bold">
                  ${(stakedUSD / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Active Validators</div>
                <div className="text-2xl font-bold">
                  {metrics?.activeValidators || 0}
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

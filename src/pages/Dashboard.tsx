import { useEffect, useState, useCallback } from "react";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMetrics, fetchRiskMetrics, MetricsData, RiskMetric } from "@/lib/rpc";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  Coins,
  PieChart,
  Shield,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [metricsData, riskData] = await Promise.all([
        fetchMetrics(),
        fetchRiskMetrics(),
      ]);
      setMetrics(metricsData);
      setRiskMetrics(riskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !metrics) {
    return <DashboardSkeleton />;
  }

  if (error && !metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Injective Intelligence Dashboard</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const riskBuffer = metrics ? ((parseFloat(metrics.insuranceFund) / parseFloat(metrics.openInterest)) * 100).toFixed(2) : "0";

  const exportData = {
    metrics,
    riskMetrics,
    lastUpdated: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Injective Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Real-time blockchain analytics and risk monitoring</p>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefresh={loadData} />
          <EnhancedExportButton 
            data={exportData} 
            filename="dashboard-snapshot" 
            exportType="dashboard"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          Warning: {error} - Showing cached data
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Block Height"
          value={metrics?.blockHeight.toLocaleString() || "0"}
          icon={Activity}
          change="+1.2% from last hour"
          trend="up"
        />
        <MetricCard
          title="Transactions Per Second"
          value={metrics?.tps || 0}
          icon={Zap}
          change={`${metrics?.avgBlockTime.toFixed(2) || "0"}s avg block time`}
          trend="neutral"
        />
        <MetricCard
          title="Active Validators"
          value={metrics?.activeValidators || 0}
          icon={Users}
          change="Network healthy"
          trend="up"
        />
        <MetricCard
          title="Total Staked INJ"
          value={`$${(parseFloat(metrics?.totalStaked || "0") / 1000000).toFixed(2)}M`}
          icon={Coins}
          change="+2.1% this week"
          trend="up"
        />
      </div>

      {/* Financial Safety Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Open Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(parseFloat(metrics?.openInterest || "0") / 1000000).toFixed(2)}M
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across all derivative markets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Insurance Fund
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(parseFloat(metrics?.insuranceFund || "0") / 1000000).toFixed(2)}M
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Protocol solvency buffer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Risk Buffer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{riskBuffer}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Insurance ÷ Open Interest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              24h Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Spot Markets</span>
                <span className="text-sm font-medium">
                  ${(parseFloat(metrics?.spotVolume24h || "0") / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "40%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Derivatives</span>
                <span className="text-sm font-medium">
                  ${(parseFloat(metrics?.derivativesVolume24h || "0") / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "60%" }} />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Volume</span>
                <span className="text-lg font-bold">
                  ${((parseFloat(metrics?.spotVolume24h || "0") + parseFloat(metrics?.derivativesVolume24h || "0")) / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskMetrics.slice(0, 5).map((metric) => (
                <div key={metric.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{metric.category}</div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                  <RiskBadge level={metric.level} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

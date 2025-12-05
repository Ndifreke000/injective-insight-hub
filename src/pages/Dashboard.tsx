import { useEffect, useState, useCallback } from "react";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMetrics, fetchRiskMetrics, MetricsData, RiskMetric } from "@/lib/rpc";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { formatCurrency } from "@/lib/format-numbers";
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
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time blockchain intelligence</p>
        </div>
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
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time blockchain intelligence</p>
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
        <div className="text-sm text-warning bg-warning/10 border border-warning/20 px-4 py-3 rounded-lg">
          {error} — Showing cached data
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Block Height"
          value={metrics?.blockHeight.toLocaleString() || "—"}
          icon={Activity}
          change="+1.2% from last hour"
          trend="up"
        />
        <MetricCard
          title="TPS"
          value={metrics?.tps || "—"}
          icon={Zap}
          change={`${metrics?.avgBlockTime.toFixed(2) || "—"}s avg block`}
          trend="neutral"
        />
        <MetricCard
          title="Validators"
          value={metrics?.activeValidators || "—"}
          icon={Users}
          change="Network healthy"
          trend="up"
        />
        <MetricCard
          title="Total Staked"
          value={formatCurrency(parseFloat(metrics?.totalStaked || "0"))}
          icon={Coins}
          change="+2.1% this week"
          trend="up"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <PieChart className="h-4 w-4 text-primary" />
              Open Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-foreground">
              ${(parseFloat(metrics?.openInterest || "0") / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all derivative markets
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              Insurance Fund
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-foreground">
              {formatCurrency(parseFloat(metrics?.insuranceFund || "0"))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Protocol solvency buffer
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-warning" />
              Risk Buffer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metric-value text-foreground">{riskBuffer}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Insurance ÷ Open Interest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading & Risk */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              24h Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-muted-foreground">Spot Markets</span>
                <span className="text-sm font-mono font-medium">
                  ${(parseFloat(metrics?.spotVolume24h || "0") / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "40%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-muted-foreground">Derivatives</span>
                <span className="text-sm font-mono font-medium">
                  ${(parseFloat(metrics?.derivativesVolume24h || "0") / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: "60%" }} />
              </div>
            </div>
            <div className="pt-3 border-t border-border/50">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Total Volume</span>
                <span className="text-lg font-mono font-semibold">
                  ${((parseFloat(metrics?.spotVolume24h || "0") + parseFloat(metrics?.derivativesVolume24h || "0")) / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskMetrics.slice(0, 5).map((metric) => (
                <div key={metric.category} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{metric.category}</div>
                    <div className="text-xs text-muted-foreground truncate">{metric.description}</div>
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
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { fetchMetrics, fetchRiskMetrics, MetricsData, RiskMetric } from "@/lib/rpc";
import { AlertTriangle, Shield, TrendingUp, Activity } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Risk() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [metricsData, riskData] = await Promise.all([
        fetchMetrics(),
        fetchRiskMetrics(),
      ]);
      setMetrics(metricsData);
      setRiskMetrics(riskData);
    };

    loadData();
  }, []);

  if (!metrics) {
    return <PageLoadingSkeleton />;
  }

  const riskBuffer = ((parseFloat(metrics.insuranceFund) / parseFloat(metrics.openInterest)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Risk & Safety Metrics</h1>
          <p className="text-muted-foreground">Protocol solvency and risk monitoring</p>
        </div>
        <ExportButton data={{ metrics, riskMetrics }} filename="risk-data" />
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
          title="Open Interest"
          value={`$${(parseFloat(metrics.openInterest) / 1000000).toFixed(2)}M`}
          icon={TrendingUp}
          change="Total exposure"
          trend="neutral"
        />
        <MetricCard
          title="Active Markets"
          value="71"
          icon={Activity}
          change="Derivatives trading"
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
                  className={`h-full rounded-full transition-all ${riskBuffer > 5 ? 'bg-success' : riskBuffer > 2 ? 'bg-warning' : 'bg-destructive'
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

      {/* Risk Metrics Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskMetrics.map((metric) => (
              <div key={metric.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{metric.category}</div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                  <RiskBadge level={metric.level} />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{metric.score}/100</div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all ${metric.level === "low" ? "bg-success" :
                          metric.level === "medium" ? "bg-warning" : "bg-destructive"
                        }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Fund Details */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Fund Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-2">Fund Composition</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Balance</span>
                    <span className="font-medium">${(parseFloat(metrics.insuranceFund) / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of Funds</span>
                    <span className="font-medium">129</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Fund Size</span>
                    <span className="font-medium">${(parseFloat(metrics.insuranceFund) / 129 / 1000).toFixed(2)}K</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Risk Coverage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coverage Ratio</span>
                    <span className="font-medium">{riskBuffer.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${riskBuffer > 5 ? 'text-success' : riskBuffer > 2 ? 'text-warning' : 'text-destructive'}`}>
                      {riskBuffer > 5 ? 'Healthy' : riskBuffer > 2 ? 'Adequate' : 'Low'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Protected OI</span>
                    <span className="font-medium">${(parseFloat(metrics.openInterest) / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

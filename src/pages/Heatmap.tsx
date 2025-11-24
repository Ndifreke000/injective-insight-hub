import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { fetchRiskMetrics, RiskMetric } from "@/lib/rpc";
import { Activity, AlertTriangle } from "lucide-react";
import { DataFilters } from "@/components/DataFilters";
import { ExportButton } from "@/components/ExportButton";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { LiquidationHeatmap } from "@/components/LiquidationHeatmap";

export default function Heatmap() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRiskMetrics();
      setRiskMetrics(data);
    };

    loadData();
  }, []);

  const filteredMetrics = useMemo(() => {
    return riskMetrics.filter(m =>
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [riskMetrics, searchQuery]);

  if (riskMetrics.length === 0) {
    return <PageLoadingSkeleton />;
  }

  const avgScore = filteredMetrics.reduce((sum, m) => sum + m.score, 0) / filteredMetrics.length;
  const criticalRisks = filteredMetrics.filter(m => m.level === "high").length;
  const overallRisk = avgScore > 70 ? "low" : avgScore > 40 ? "medium" : "high";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Market Risk Heatmap</h1>
          <p className="text-muted-foreground">Systemic risk aggregation and monitoring</p>
        </div>
        <ExportButton data={filteredMetrics} filename="risk-heatmap" />
      </div>

      <DataFilters
        searchPlaceholder="Search risk categories..."
        onSearchChange={setSearchQuery}
        showDateRange={false}
      />

      <DataFilters
        searchPlaceholder="Search risk categories..."
        onSearchChange={setSearchQuery}
        showDateRange={false}
      />

      {/* Liquidation Heatmap - The Killer Feature */}
      <LiquidationHeatmap />

      {/* Overall Risk Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System-Wide Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Overall Risk Level</div>
              <RiskBadge level={overallRisk as "low" | "medium" | "high"} className="text-lg px-4 py-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Average Risk Score</div>
              <div className="text-3xl font-bold">{avgScore.toFixed(0)}/100</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Critical Risks</div>
              <div className="text-3xl font-bold flex items-center gap-2">
                {criticalRisks}
                {criticalRisks > 0 && <AlertTriangle className="h-6 w-6 text-destructive" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Heatmap Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMetrics.map((metric, index) => (
              <Card key={index} className="border-2" style={{
                borderColor: metric.level === "high" ? "hsl(var(--destructive))" :
                  metric.level === "medium" ? "hsl(var(--warning))" :
                    "hsl(var(--success))"
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{metric.category}</CardTitle>
                    <RiskBadge level={metric.level} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className="font-bold">{metric.score}/100</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${metric.level === "high" ? "bg-destructive" :
                            metric.level === "medium" ? "bg-warning" :
                              "bg-success"
                            }`}
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: metric.level === "high" ? "hsl(var(--destructive))" :
                          metric.level === "medium" ? "hsl(var(--warning))" :
                            "hsl(var(--success))"
                      }}
                    />
                    <span className="text-sm font-medium">{metric.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{metric.score}/100</span>
                    <RiskBadge level={metric.level} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-7">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Indicators Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <RiskBadge level="low" />
              <p className="text-sm text-muted-foreground">
                <strong>Low Risk:</strong> Systems operating normally with healthy metrics. Minimal intervention required.
              </p>
            </div>
            <div className="space-y-2">
              <RiskBadge level="medium" />
              <p className="text-sm text-muted-foreground">
                <strong>Medium Risk:</strong> Elevated metrics requiring monitoring. Consider risk mitigation strategies.
              </p>
            </div>
            <div className="space-y-2">
              <RiskBadge level="high" />
              <p className="text-sm text-muted-foreground">
                <strong>High Risk:</strong> Critical conditions detected. Immediate attention and action recommended.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

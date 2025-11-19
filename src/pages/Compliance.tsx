import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Shield, AlertCircle, CheckCircle, Activity } from "lucide-react";

export default function Compliance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Compliance & AML</h1>
        <p className="text-muted-foreground">High-level compliance monitoring and risk assessment</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Compliance Status"
          value="Active"
          icon={Shield}
          change="Monitoring enabled"
          trend="up"
        />
        <MetricCard
          title="Risk Patterns"
          value="3"
          icon={AlertCircle}
          change="Under review"
          trend="neutral"
        />
        <MetricCard
          title="Cleared Transactions"
          value="99.8%"
          icon={CheckCircle}
          change="24h success rate"
          trend="up"
        />
        <MetricCard
          title="Active Monitoring"
          value="24/7"
          icon={Activity}
          change="Real-time analysis"
          trend="neutral"
        />
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Monitoring Scope</div>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Transaction pattern analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    High-risk behavior detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Suspicious activity flagging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Cross-chain movement tracking
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Compliance Standards</div>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Sanction list screening
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Risk-based approach (RBA)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Enhanced due diligence (EDD)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-success" />
                    Ongoing monitoring
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Pattern Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Unusual Volume Patterns</span>
              <span className="text-sm font-medium text-success">None detected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rapid Movement Chains</span>
              <span className="text-sm font-medium text-warning">2 flagged</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">High-Risk Jurisdictions</span>
              <span className="text-sm font-medium text-success">Minimal activity</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Structuring Patterns</span>
              <span className="text-sm font-medium text-warning">1 under review</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Addresses Screened (24h)</span>
              <span className="text-sm font-medium">24,567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transactions Analyzed</span>
              <span className="text-sm font-medium">127,894</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">False Positive Rate</span>
              <span className="text-sm font-medium text-success">0.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="text-sm font-medium">&lt;1 second</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The system continuously monitors for patterns that may indicate suspicious activity, including:
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Large Transfers</div>
                <div className="text-xs text-muted-foreground">
                  Monitoring transfers above risk thresholds
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Rapid Movements</div>
                <div className="text-xs text-muted-foreground">
                  Tracking quick cross-chain asset flows
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Mixing Behavior</div>
                <div className="text-xs text-muted-foreground">
                  Detecting obfuscation attempts
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Layering Patterns</div>
                <div className="text-xs text-muted-foreground">
                  Identifying complex transaction chains
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Geographic Risk</div>
                <div className="text-xs text-muted-foreground">
                  Screening high-risk jurisdictions
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm font-medium mb-1">Velocity Analysis</div>
                <div className="text-xs text-muted-foreground">
                  Monitoring transaction frequency
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">System Uptime</div>
              <div className="text-2xl font-bold text-success">99.99%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Processing Speed</div>
              <div className="text-2xl font-bold">847ms</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Alert Accuracy</div>
              <div className="text-2xl font-bold text-success">98.7%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Coverage</div>
              <div className="text-2xl font-bold">100%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

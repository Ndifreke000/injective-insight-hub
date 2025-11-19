import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchMetrics, MetricsData } from "@/lib/rpc";
import { Coins, Users, TrendingUp, Award } from "lucide-react";

export default function Staking() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMetrics();
      setMetrics(data);
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading staking data...</div>
      </div>
    );
  }

  const stakedPercentage = 72.5;
  const apr = 12.4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Staking</h1>
        <p className="text-muted-foreground">Network staking metrics and validator information</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Staked INJ"
          value={`$${(parseFloat(metrics.totalStaked) / 1000000).toFixed(2)}M`}
          icon={Coins}
          change={`${stakedPercentage}% of supply`}
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
          title="Staking APR"
          value={`${apr}%`}
          icon={TrendingUp}
          change="Annual returns"
          trend="up"
        />
        <MetricCard
          title="Total Delegators"
          value="24,567"
          icon={Award}
          change="+325 this week"
          trend="up"
        />
      </div>

      {/* Staking Overview */}
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
                  {(parseFloat(metrics.totalStaked) / 1000000).toFixed(2)}M / 100M INJ ({stakedPercentage}%)
                </span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${stakedPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bonded Tokens</div>
                <div className="text-2xl font-bold">
                  ${(parseFloat(metrics.totalStaked) / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Not Bonded</div>
                <div className="text-2xl font-bold">
                  ${ ((100 - stakedPercentage) / 100 * 100).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bonding Ratio</div>
                <div className="text-2xl font-bold">{stakedPercentage}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validator Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Validator Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Validators</span>
              <span className="text-sm font-medium">{metrics.activeValidators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Set</span>
              <span className="text-sm font-medium">{metrics.activeValidators}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Inactive Validators</span>
              <span className="text-sm font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Commission</span>
              <span className="text-sm font-medium">5.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Min Self-Delegation</span>
              <span className="text-sm font-medium">10,000 INJ</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delegation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Delegators</span>
              <span className="text-sm font-medium">24,567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Delegation Size</span>
              <span className="text-sm font-medium">2,952 INJ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Largest Delegation</span>
              <span className="text-sm font-medium">1.2M INJ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Delegation Flow (24h)</span>
              <span className="text-sm font-medium text-success">+$2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Unbonding Period</span>
              <span className="text-sm font-medium">21 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards & APR */}
      <Card>
        <CardHeader>
          <CardTitle>Staking Rewards & Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Current APR</div>
                <div className="text-4xl font-bold text-primary">{apr}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on current inflation and staking ratio
                </p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Inflation Rate</div>
                <div className="text-2xl font-bold">7.2%</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Daily Rewards Pool</div>
                <div className="text-2xl font-bold">$284,567</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Rewards Distributed (24h)</div>
                <div className="text-2xl font-bold">$278,942</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Next Reward Distribution</div>
                <div className="text-sm font-medium">In 4 hours 23 minutes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Validators */}
      <Card>
        <CardHeader>
          <CardTitle>Top Validators by Stake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, i) => {
              const stake = (8 - i * 0.5) * 1000000;
              const percentage = (stake / parseFloat(metrics!.totalStaked)) * 100;
              
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      Validator {i + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ${(stake / 1000000).toFixed(2)}M ({percentage.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage * 2}%`,
                        backgroundColor: `hsl(var(--chart-${(i % 5) + 1}))`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Network Security */}
      <Card>
        <CardHeader>
          <CardTitle>Network Security Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Nakamoto Coefficient</div>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                Validators needed to halt the chain
              </p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Top 10 Stake</div>
              <div className="text-2xl font-bold">38.2%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Stake concentration in top validators
              </p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Security Budget</div>
              <div className="text-2xl font-bold">$72.5M</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cost to attack the network
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

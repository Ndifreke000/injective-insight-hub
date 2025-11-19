import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchDerivatives, DerivativeData } from "@/lib/rpc";
import { PieChart, TrendingUp, DollarSign, Activity } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Derivatives() {
  const [derivatives, setDerivatives] = useState<DerivativeData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDerivatives();
      setDerivatives(data);
    };

    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (derivatives.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading derivatives data...</div>
      </div>
    );
  }

  const totalOI = derivatives.reduce((sum, d) => sum + parseFloat(d.openInterest), 0);
  const avgFunding = derivatives.reduce((sum, d) => sum + parseFloat(d.fundingRate), 0) / derivatives.length;
  const avgLeverage = derivatives.reduce((sum, d) => sum + parseFloat(d.leverage), 0) / derivatives.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Derivatives Markets</h1>
          <p className="text-muted-foreground">Perpetual futures and derivatives analytics</p>
        </div>
        <ExportButton data={derivatives} filename="derivatives-data" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Open Interest"
          value={`$${(totalOI / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          change="+5.2% from yesterday"
          trend="up"
        />
        <MetricCard
          title="Average Funding Rate"
          value={`${(avgFunding * 100).toFixed(4)}%`}
          icon={TrendingUp}
          change="8h rate"
          trend={avgFunding > 0 ? "up" : "down"}
        />
        <MetricCard
          title="Active Markets"
          value={derivatives.length}
          icon={PieChart}
          change="Perpetual futures"
          trend="neutral"
        />
        <MetricCard
          title="Avg Leverage"
          value={`${avgLeverage.toFixed(1)}x`}
          icon={Activity}
          change="Across all positions"
          trend="neutral"
        />
      </div>

      {/* Derivatives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Perpetual Markets Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Open Interest</TableHead>
                  <TableHead>Funding Rate (8h)</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>Oracle Price</TableHead>
                  <TableHead>Avg Leverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {derivatives.map((deriv, index) => {
                  const fundingRate = parseFloat(deriv.fundingRate);
                  const priceDiff = ((parseFloat(deriv.markPrice) - parseFloat(deriv.oraclePrice)) / parseFloat(deriv.oraclePrice)) * 100;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{deriv.market}</TableCell>
                      <TableCell>${(parseFloat(deriv.openInterest) / 1000000).toFixed(2)}M</TableCell>
                      <TableCell className={fundingRate > 0 ? "text-success" : "text-destructive"}>
                        {(fundingRate * 100).toFixed(4)}%
                      </TableCell>
                      <TableCell>${parseFloat(deriv.markPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        ${parseFloat(deriv.oraclePrice).toLocaleString()}
                      </TableCell>
                      <TableCell>{deriv.leverage}x</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Open Interest Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Open Interest Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {derivatives.map((deriv, index) => {
              const percentage = (parseFloat(deriv.openInterest) / totalOI) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{deriv.market}</span>
                    <span className="text-sm text-muted-foreground">
                      ${(parseFloat(deriv.openInterest) / 1000000).toFixed(2)}M ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Funding Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={derivatives.map(d => ({
              market: d.market,
              fundingRate: parseFloat(d.fundingRate) * 100
            }))}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="market" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v.toFixed(3)}%`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="fundingRate" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
                      {isPositive ? '+' : ''}{deviation.toFixed(3)}%
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Low deviation indicates healthy price discovery and oracle reliability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

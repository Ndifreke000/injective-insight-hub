import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchDerivativesFromBackend } from "@/lib/backend-api";
import { PieChart, TrendingUp, DollarSign, Activity } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataFilters } from "@/components/DataFilters";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Derivative data interface for frontend
interface DerivativeData {
  market: string;
  openInterest: string;
  fundingRate: string;
  markPrice: string;
  oraclePrice: string;
  leverage: string;
}

export default function Derivatives() {
  const [derivatives, setDerivatives] = useState<DerivativeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[Derivatives] Fetching from backend API...');
        const markets = await fetchDerivativesFromBackend();
        console.log(`[Derivatives] Received ${markets.length} markets from backend`);

        // Transform backend data to DerivativeData format
        const transformedData: DerivativeData[] = markets.map(market => ({
          market: market.ticker || "Unknown",
          openInterest: "0", // Backend doesn't provide this yet
          fundingRate: "0.0001", // Placeholder
          markPrice: "0",
          oraclePrice: "0",
          leverage: market.initialMarginRatio
            ? (1 / parseFloat(market.initialMarginRatio)).toFixed(1)
            : "10.0"
        }));

        setDerivatives(transformedData);
      } catch (error) {
        console.error("Error loading derivatives from backend:", error);
        // Keep existing data if refresh fails
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // No auto-refresh per user request
  }, []);

  // CRITICAL: All hooks must be called BEFORE any conditional returns
  const filteredDerivatives = useMemo(() => {
    return derivatives.filter(d =>
      d.market.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [derivatives, searchQuery]);

  // Memoize expensive calculations - only recalculate when filteredDerivatives changes
  const { totalOI, avgFunding, avgLeverage } = useMemo(() => {
    const oi = filteredDerivatives.reduce((sum, d) => sum + parseFloat(d.openInterest), 0);
    const funding = filteredDerivatives.length > 0
      ? filteredDerivatives.reduce((sum, d) => sum + parseFloat(d.fundingRate), 0) / filteredDerivatives.length
      : 0;
    const leverage = filteredDerivatives.length > 0
      ? filteredDerivatives.reduce((sum, d) => sum + parseFloat(d.leverage), 0) / filteredDerivatives.length
      : 0;

    return { totalOI: oi, avgFunding: funding, avgLeverage: leverage };
  }, [filteredDerivatives]);

  // Loading state check AFTER all hooks
  if (loading) {
    return <PageLoadingSkeleton />;
  }

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
          value={filteredDerivatives.length}
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
          <DataFilters
            searchPlaceholder="Search markets..."
            onSearchChange={setSearchQuery}
            showDateRange={false}
          />
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
                {filteredDerivatives.map((deriv, index) => {
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
            {filteredDerivatives.map((deriv, index) => {
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
            <LineChart data={filteredDerivatives.map(d => ({
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
    </div>
  );
}

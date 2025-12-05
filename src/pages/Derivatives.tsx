import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchDerivatives, DerivativeData } from "@/lib/rpc";
import { PieChart, TrendingUp, DollarSign, Activity } from "lucide-react";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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

export default function Derivatives() {
  const [derivatives, setDerivatives] = useState<DerivativeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (retries = 2) => {
    setError(null);
    try {
      console.log('[Derivatives] Fetching from RPC...');
      const data = await fetchDerivatives();

      if (data.length === 0 && retries > 0) {
        console.warn(`[Derivatives] Empty data, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return loadData(retries - 1);
      }

      console.log(`[Derivatives] Received ${data.length} markets`);
      setDerivatives(data);
    } catch (err) {
      if (retries > 0) {
        console.warn(`[Derivatives] Error, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return loadData(retries - 1);
      }
      setError(err instanceof Error ? err.message : "Failed to load derivatives");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData]);

  // CRITICAL: All hooks must be called BEFORE any conditional returns
  const filteredDerivatives = useMemo(() => {
    return derivatives.filter(d =>
      d.market.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [derivatives, searchQuery]);

  // Memoize expensive calculations - only recalculate when filteredDerivatives changes
  const { totalOI, avgFunding, avgLeverage } = useMemo(() => {
    const oi = filteredDerivatives.reduce((sum, d) => sum + parseFloat(d.openInterest || "0"), 0);

    // Normalize funding rates that might be in chain format
    const normalizedRates = filteredDerivatives.map(d => {
      let rate = parseFloat(d.fundingRate || "0");
      if (Math.abs(rate) > 1000) {
        rate = rate / 1e18; // Normalize from chain format
      }
      return rate;
    });

    const funding = normalizedRates.length > 0
      ? normalizedRates.reduce((sum, r) => sum + r, 0) / normalizedRates.length
      : 0;
    const leverage = filteredDerivatives.length > 0
      ? filteredDerivatives.reduce((sum, d) => sum + parseFloat(d.leverage || "10"), 0) / filteredDerivatives.length
      : 0;

    return { totalOI: oi, avgFunding: funding, avgLeverage: leverage };
  }, [filteredDerivatives]);

  // Loading state check AFTER all hooks
  if (loading && derivatives.length === 0) {
    return <PageLoadingSkeleton />;
  }

  if (error && derivatives.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Derivatives Markets</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Derivatives Markets</h1>
          <p className="text-muted-foreground">Perpetual futures and derivatives analytics</p>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefresh={loadData} />
          <EnhancedExportButton data={derivatives} filename="derivatives-data" exportType="derivatives" />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          Warning: {error} - Showing cached data
        </div>
      )}

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
                  let fundingRate = parseFloat(deriv.fundingRate || "0");
                  // Normalize funding rate if it's in chain format
                  if (Math.abs(fundingRate) > 1000) {
                    fundingRate = fundingRate / 1e18;
                  }
                  const markPrice = parseFloat(deriv.markPrice || "0");
                  const oraclePrice = parseFloat(deriv.oraclePrice || "0");
                  const openInterest = parseFloat(deriv.openInterest || "0");

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{deriv.market}</TableCell>
                      <TableCell>
                        {openInterest > 0
                          ? `$${(openInterest / 1000000).toFixed(2)}M`
                          : '$0.00M'
                        }
                      </TableCell>
                      <TableCell className={fundingRate > 0 ? "text-success" : fundingRate < 0 ? "text-destructive" : ""}>
                        {(fundingRate * 100).toFixed(4)}%
                      </TableCell>
                      <TableCell>
                        {markPrice > 0
                          ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '--'
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {oraclePrice > 0
                          ? `$${oraclePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '--'
                        }
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
          {totalOI === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Open Interest data is currently unavailable
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDerivatives
                .filter(d => parseFloat(d.openInterest || "0") > 0)
                .slice(0, 10)
                .map((deriv, index) => {
                  const oi = parseFloat(deriv.openInterest || "0");
                  const percentage = totalOI > 0 ? (oi / totalOI) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{deriv.market}</span>
                        <span className="text-sm text-muted-foreground">
                          ${(oi / 1000000).toFixed(2)}M ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredDerivatives.slice(0, 20).map(d => {
              let rate = parseFloat(d.fundingRate || "0");
              if (Math.abs(rate) > 1000) rate = rate / 1e18;
              return {
                market: d.market.split('/')[0],
                fundingRate: rate * 100
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="market" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} interval={0} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v.toFixed(3)}%`} />
              <Line type="monotone" dataKey="fundingRate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

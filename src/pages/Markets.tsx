import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchOrderbooks, fetchDerivatives, OrderbookData, DerivativeData } from "@/lib/rpc";
import { Building2, TrendingUp, PieChart, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { RefreshButton } from "@/components/RefreshButton";
import { ErrorState } from "@/components/ErrorState";
import { DataFilters } from "@/components/DataFilters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Markets() {
  const [spotMarkets, setSpotMarkets] = useState<OrderbookData[]>([]);
  const [perpMarkets, setPerpMarkets] = useState<DerivativeData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (retries = 2) => {
    setError(null);
    try {
      const [spot, perp] = await Promise.all([
        fetchOrderbooks().catch(() => []),
        fetchDerivatives().catch(() => []),
      ]);

      // If both are empty and we have retries left, retry
      if (spot.length === 0 && perp.length === 0 && retries > 0) {
        console.warn(`[Markets] Empty data, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return loadData(retries - 1);
      }

      setSpotMarkets(spot);
      setPerpMarkets(perp);
    } catch (err) {
      // Retry on error
      if (retries > 0) {
        console.warn(`[Markets] Error, retrying... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return loadData(retries - 1);
      }
      setError(err instanceof Error ? err.message : "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const filteredSpotMarkets = useMemo(() => {
    return spotMarkets.filter(m =>
      m.market.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spotMarkets, searchQuery]);

  const filteredPerpMarkets = useMemo(() => {
    return perpMarkets.filter(m =>
      m.market.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [perpMarkets, searchQuery]);

  // Calculate dynamic metrics
  const calculatedMetrics = useMemo(() => {
    // Avg spread for spot markets
    const validSpotMarkets = spotMarkets.filter(m =>
      parseFloat(m.spread) > 0 && parseFloat(m.bestBid) > 0
    );
    const avgSpread = validSpotMarkets.length > 0
      ? validSpotMarkets.reduce((sum, m) =>
        sum + (parseFloat(m.spread) / parseFloat(m.bestBid)) * 100, 0
      ) / validSpotMarkets.length
      : 0;

    // Market health based on liquidity scores
    const liquidityScores = validSpotMarkets.map(m => {
      const spreadPct = (parseFloat(m.spread) / parseFloat(m.bestBid)) * 100;
      return Math.max(0, 95 - (spreadPct * 10));
    });
    const avgHealth = liquidityScores.length > 0
      ? liquidityScores.reduce((a, b) => a + b, 0) / liquidityScores.length
      : 0;

    // Total OI from perp markets
    const totalOI = perpMarkets.reduce((sum, m) =>
      sum + parseFloat(m.openInterest || "0"), 0
    );

    // Average funding rate - normalize from chain format (10^18)
    // Raw values from chain are like 503893897013675... and need division by 10^18
    const validPerpMarkets = perpMarkets.filter(m => {
      const rate = parseFloat(m.fundingRate);
      return rate !== 0 && !isNaN(rate);
    });

    let avgFundingRate = 0;
    if (validPerpMarkets.length > 0) {
      const sumRates = validPerpMarkets.reduce((sum, m) => {
        let rate = parseFloat(m.fundingRate);
        // If rate is absurdly large (>1000), it's likely in chain format - normalize
        if (Math.abs(rate) > 1000) {
          rate = rate / 1e18; // Normalize from chain format
        }
        return sum + rate;
      }, 0);
      avgFundingRate = sumRates / validPerpMarkets.length;
    }

    return {
      avgSpread: avgSpread.toFixed(3),
      marketHealth: avgHealth.toFixed(1),
      totalOI: (totalOI / 1e6).toFixed(1),
      avgFundingRate: (avgFundingRate * 100).toFixed(4)
    };
  }, [spotMarkets, perpMarkets]);

  if (loading && spotMarkets.length === 0) {
    return <PageLoadingSkeleton />;
  }

  if (error && spotMarkets.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Exchange Markets</h1>
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exchange Markets</h1>
          <p className="text-muted-foreground">Comprehensive market overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefresh={loadData} />
          <EnhancedExportButton data={{ spot: filteredSpotMarkets, perp: filteredPerpMarkets }} filename="markets-data" exportType="markets" />
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
          title="Spot Markets"
          value={spotMarkets.length}
          icon={Building2}
          change="Active trading pairs"
          trend="neutral"
        />
        <MetricCard
          title="Perpetual Markets"
          value={perpMarkets.length}
          icon={PieChart}
          change="Futures contracts"
          trend="neutral"
        />
        <MetricCard
          title="Avg Spread"
          value={`${calculatedMetrics.avgSpread}%`}
          icon={Activity}
          change="Across spot markets"
          trend="neutral"
        />
        <MetricCard
          title="Market Health"
          value={`${calculatedMetrics.marketHealth}%`}
          icon={TrendingUp}
          change="Avg liquidity score"
          trend={parseFloat(calculatedMetrics.marketHealth) > 90 ? "up" : "neutral"}
        />
      </div>

      {/* Markets Tabs */}
      <Tabs defaultValue="spot">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spot">Spot Markets</TabsTrigger>
          <TabsTrigger value="perp">Perpetual Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="spot" className="space-y-6">
          <DataFilters
            searchPlaceholder="Search spot markets..."
            onSearchChange={setSearchQuery}
            showDateRange={false}
          />

          <Card>
            <CardHeader>
              <CardTitle>Spot Markets Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Best Bid</TableHead>
                      <TableHead>Best Ask</TableHead>
                      <TableHead>Spread</TableHead>
                      <TableHead>Spread %</TableHead>
                      <TableHead>Liquidity Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpotMarkets.map((market, index) => {
                      const spreadPct = (parseFloat(market.spread) / parseFloat(market.bestBid)) * 100;
                      const liquidityScore = 95 - (spreadPct * 10);

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{market.market}</TableCell>
                          <TableCell className="text-success">${market.bestBid}</TableCell>
                          <TableCell className="text-destructive">${market.bestAsk}</TableCell>
                          <TableCell>${market.spread}</TableCell>
                          <TableCell>{spreadPct.toFixed(3)}%</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-[100px]">
                                <div
                                  className={`h-full ${liquidityScore > 90 ? "bg-success" :
                                    liquidityScore > 80 ? "bg-warning" :
                                      "bg-destructive"
                                    }`}
                                  style={{ width: `${liquidityScore}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {liquidityScore.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Spread Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spread Distribution Across Spot Markets</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSpotMarkets.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available for chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredSpotMarkets
                    .filter(m => parseFloat(m.spread) > 0 && parseFloat(m.bestBid) > 0)
                    .map(m => ({
                      market: m.market.split('/')[0].replace(' PERP', ''),
                      fullName: m.market,
                      spread: parseFloat(m.spread),
                      spreadPct: (parseFloat(m.spread) / parseFloat(m.bestBid)) * 100
                    }))
                    .sort((a, b) => b.spreadPct - a.spreadPct)
                    .slice(0, 8)
                  }
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="market"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                      width={50}
                    />

                    <Bar dataKey="spreadPct" fill="hsl(var(--primary))" name="Spread %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spot Trading Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Markets</span>
                  <span className="text-sm font-medium">{spotMarkets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Bid-Ask Spread</span>
                  <span className="text-sm font-medium">{calculatedMetrics.avgSpread}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Health Score</span>
                  <span className="text-sm font-medium">{calculatedMetrics.marketHealth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Trading Pairs</span>
                  <span className="text-sm font-medium">{filteredSpotMarkets.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Liquidity Score</span>
                  <span className={`text-sm font-medium ${parseFloat(calculatedMetrics.marketHealth) > 90 ? 'text-success' : 'text-warning'}`}>
                    {parseFloat(calculatedMetrics.marketHealth) > 90 ? 'Excellent' : parseFloat(calculatedMetrics.marketHealth) > 80 ? 'Good' : 'Fair'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Spread</span>
                  <span className={`text-sm font-medium ${parseFloat(calculatedMetrics.avgSpread) < 0.1 ? 'text-success' : 'text-warning'}`}>
                    {calculatedMetrics.avgSpread}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Markets</span>
                  <span className="text-sm font-medium">{spotMarkets.length + perpMarkets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Efficiency</span>
                  <span className="text-sm font-medium">{calculatedMetrics.marketHealth}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="perp" className="space-y-6">
          <DataFilters
            searchPlaceholder="Search perpetual markets..."
            onSearchChange={setSearchQuery}
            showDateRange={false}
          />

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
                      <TableHead>Mark Price</TableHead>
                      <TableHead>Oracle Price</TableHead>
                      <TableHead>Funding Rate</TableHead>
                      <TableHead>Open Interest</TableHead>
                      <TableHead>Avg Leverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPerpMarkets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No perpetual markets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPerpMarkets.map((market, index) => {
                        let fundingRate = parseFloat(market.fundingRate || "0");
                        // Normalize funding rate if in chain format
                        if (Math.abs(fundingRate) > 1000) {
                          fundingRate = fundingRate / 1e18;
                        }
                        const markPrice = parseFloat(market.markPrice || "0");
                        const oraclePrice = parseFloat(market.oraclePrice || "0");
                        const openInterest = parseFloat(market.openInterest || "0");

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{market.market}</TableCell>
                            <TableCell>
                              {markPrice > 0 ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {oraclePrice > 0 ? `$${oraclePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                            </TableCell>
                            <TableCell className={fundingRate > 0 ? "text-success" : fundingRate < 0 ? "text-destructive" : ""}>
                              {(fundingRate * 100).toFixed(4)}%
                            </TableCell>
                            <TableCell>
                              {openInterest > 0
                                ? `$${(openInterest / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
                                : '$0.00M'
                              }
                            </TableCell>
                            <TableCell>{market.leverage}x</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Open Interest Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Open Interest Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPerpMarkets.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available for chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={filteredPerpMarkets
                    .filter(m => parseFloat(m.openInterest) > 0)
                    .map(m => ({
                      market: m.market.split('/')[0].replace(' PERP', ''),
                      fullName: m.market,
                      openInterest: parseFloat(m.openInterest) / 1000000,
                      fundingRate: parseFloat(m.fundingRate) * 100
                    }))
                    .sort((a, b) => b.openInterest - a.openInterest)
                    .slice(0, 8)
                  }
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="market"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      interval={0}
                      height={30}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value) => `$${value.toFixed(0)}M`}
                      width={50}
                    />
                    <Bar dataKey="openInterest" fill="hsl(var(--primary))" name="openInterest" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Derivatives Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Open Interest</span>
                  <span className="text-sm font-medium">${calculatedMetrics.totalOI}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Funding Rate</span>
                  <span className="text-sm font-medium">{calculatedMetrics.avgFundingRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Perpetual Markets</span>
                  <span className="text-sm font-medium">{perpMarkets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Contracts</span>
                  <span className="text-sm font-medium">{filteredPerpMarkets.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Liquidation Risk</span>
                  <span className={`text-sm font-medium ${parseFloat(calculatedMetrics.marketHealth) > 85 ? 'text-success' : 'text-warning'}`}>
                    {parseFloat(calculatedMetrics.marketHealth) > 85 ? 'Low' : 'Moderate'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Funding Rate</span>
                  <span className={`text-sm font-medium ${parseFloat(calculatedMetrics.avgFundingRate) < 0.01 ? 'text-success' : Math.abs(parseFloat(calculatedMetrics.avgFundingRate)) < 0.05 ? 'text-warning' : 'text-destructive'}`}>
                    {calculatedMetrics.avgFundingRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total OI</span>
                  <span className="text-sm font-medium">${calculatedMetrics.totalOI}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Health</span>
                  <span className={`text-sm font-medium ${parseFloat(calculatedMetrics.marketHealth) > 90 ? 'text-success' : 'text-warning'}`}>
                    {parseFloat(calculatedMetrics.marketHealth) > 90 ? 'Healthy' : parseFloat(calculatedMetrics.marketHealth) > 80 ? 'Good' : 'Fair'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [spot, perp] = await Promise.all([
        fetchOrderbooks(),
        fetchDerivatives(),
      ]);
      setSpotMarkets(spot);
      setPerpMarkets(perp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
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
          value="0.12%"
          icon={Activity}
          change="Across all markets"
          trend="up"
        />
        <MetricCard
          title="Market Health"
          value="98.5%"
          icon={TrendingUp}
          change="Uptime & liquidity"
          trend="up"
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredSpotMarkets
                    .filter(m => parseFloat(m.spread) > 0 && parseFloat(m.bestBid) > 0)
                    .map(m => ({
                      market: m.market,
                      spread: parseFloat(m.spread),
                      spreadPct: (parseFloat(m.spread) / parseFloat(m.bestBid)) * 100
                    }))
                    .sort((a, b) => b.spreadPct - a.spreadPct)
                    .slice(0, 10)
                  }>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="market"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value.toFixed(2)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`${value.toFixed(3)}%`, 'Spread %']}
                    />
                    <Bar dataKey="spreadPct" fill="hsl(var(--primary))" name="Spread %" />
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
                  <span className="text-sm font-medium">0.18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Depth (±2%)</span>
                  <span className="text-sm font-medium">$8.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-sm font-medium">$285M</span>
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
                  <span className="text-sm font-medium text-success">Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price Stability</span>
                  <span className="text-sm font-medium text-success">Stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Execution Quality</span>
                  <span className="text-sm font-medium text-success">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Efficiency</span>
                  <span className="text-sm font-medium">96.2%</span>
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
                        const fundingRate = parseFloat(market.fundingRate);
                        const markPrice = parseFloat(market.markPrice);
                        const oraclePrice = parseFloat(market.oraclePrice);
                        const openInterest = parseFloat(market.openInterest);

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{market.market}</TableCell>
                            <TableCell>
                              {markPrice > 0 ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {oraclePrice > 0 ? `$${oraclePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                            </TableCell>
                            <TableCell className={fundingRate > 0 ? "text-success" : "text-destructive"}>
                              {(fundingRate * 100).toFixed(4)}%
                            </TableCell>
                            <TableCell>
                              {openInterest > 0
                                ? `$${(openInterest / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
                                : 'N/A'
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredPerpMarkets
                    .filter(m => parseFloat(m.openInterest) > 0)
                    .map(m => ({
                      market: m.market,
                      openInterest: parseFloat(m.openInterest) / 1000000,
                      fundingRate: parseFloat(m.fundingRate) * 100
                    }))
                    .sort((a, b) => b.openInterest - a.openInterest)
                    .slice(0, 10)
                  }>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="market"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${value.toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any, name: string) =>
                        name === 'openInterest'
                          ? [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`, 'Open Interest']
                          : [`${value.toFixed(4)}%`, 'Funding Rate']
                      }
                    />
                    <Bar dataKey="openInterest" fill="hsl(var(--primary))" name="Open Interest (M)" />
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
                  <span className="text-sm font-medium">$625M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Funding Rate</span>
                  <span className="text-sm font-medium">0.0082%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Long/Short Ratio</span>
                  <span className="text-sm font-medium">1.24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-sm font-medium">$842M</span>
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
                  <span className="text-sm font-medium text-success">Low</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Oracle Deviation</span>
                  <span className="text-sm font-medium text-success">0.08%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Funding Volatility</span>
                  <span className="text-sm font-medium">Normal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Health</span>
                  <span className="text-sm font-medium text-success">Healthy</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { fetchOrderbooks, OrderbookData } from "@/lib/rpc";
import { BookOpen, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/ExportButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DataFilters } from "@/components/DataFilters";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Orderbook() {
  const [orderbooks, setOrderbooks] = useState<OrderbookData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchOrderbooks();
      setOrderbooks(data);
    };

    loadData();
    // Auto-refresh removed for better performance
  }, []);

  const filteredOrderbooks = useMemo(() => {
    return orderbooks.filter(ob =>
      ob.market.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orderbooks, searchQuery]);

  if (filteredOrderbooks.length === 0 && orderbooks.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orderbook & Liquidity</h1>
            <p className="text-muted-foreground">Real-time market depth and liquidity analysis</p>
          </div>
          <ExportButton data={orderbooks} filename="orderbook-data" />
        </div>
        <DataFilters
          searchPlaceholder="Search markets..."
          onSearchChange={setSearchQuery}
          showDateRange={false}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No markets match your search.</div>
        </div>
      </div>
    );
  }

  if (orderbooks.length === 0) {
    return <PageLoadingSkeleton />;
  }

  const currentBook = filteredOrderbooks[selectedMarket] || filteredOrderbooks[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orderbook & Liquidity</h1>
          <p className="text-muted-foreground">Real-time market depth and liquidity analysis</p>
        </div>
        <ExportButton data={filteredOrderbooks} filename="orderbook-data" />
      </div>

      <DataFilters
        searchPlaceholder="Search markets..."
        onSearchChange={setSearchQuery}
        showDateRange={false}
      />

      {/* Market Selector */}
      <Tabs defaultValue="0" onValueChange={(v) => setSelectedMarket(parseInt(v))}>
        <TabsList className="grid w-full grid-cols-4">
          {filteredOrderbooks.slice(0, 4).map((book, index) => (
            <TabsTrigger key={index} value={String(index)}>
              {book.market}
            </TabsTrigger>
          ))}
        </TabsList>

        {filteredOrderbooks.map((book, index) => (
          <TabsContent key={index} value={String(index)} className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Best Bid"
                value={`$${book.bestBid}`}
                icon={TrendingUp}
                trend="up"
              />
              <MetricCard
                title="Best Ask"
                value={`$${book.bestAsk}`}
                icon={TrendingDown}
                trend="down"
              />
              <MetricCard
                title="Bid-Ask Spread"
                value={`$${book.spread}`}
                icon={Activity}
                change={`${((parseFloat(book.spread) / parseFloat(book.bestBid)) * 100).toFixed(3)}%`}
                trend="neutral"
              />
              <MetricCard
                title="Market"
                value={book.market}
                icon={BookOpen}
                trend="neutral"
              />
            </div>

            {/* Orderbook Visualization */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bids */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-5 w-5" />
                    Bids (Buy Orders)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {book.bids.map((bid, i) => {
                      const maxQty = Math.max(...book.bids.map(b => parseFloat(b.quantity)));
                      const width = (parseFloat(bid.quantity) / maxQty) * 100;
                      return (
                        <div key={i} className="relative">
                          <div
                            className="absolute inset-0 bg-success/10 rounded"
                            style={{ width: `${width}%` }}
                          />
                          <div className="relative flex justify-between text-sm p-2">
                            <span className="font-mono text-success">${bid.price}</span>
                            <span className="font-mono">{parseFloat(bid.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Asks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-5 w-5" />
                    Asks (Sell Orders)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {book.asks.map((ask, i) => {
                      const maxQty = Math.max(...book.asks.map(a => parseFloat(a.quantity)));
                      const width = (parseFloat(ask.quantity) / maxQty) * 100;
                      return (
                        <div key={i} className="relative">
                          <div
                            className="absolute inset-0 bg-destructive/10 rounded"
                            style={{ width: `${width}%` }}
                          />
                          <div className="relative flex justify-between text-sm p-2">
                            <span className="font-mono text-destructive">${ask.price}</span>
                            <span className="font-mono">{parseFloat(ask.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liquidity Concentration */}
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Bid Liquidity</span>
                      <span className="text-sm font-medium">
                        {book.bids.reduce((sum, b) => sum + parseFloat(b.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: "48%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Ask Liquidity</span>
                      <span className="text-sm font-medium">
                        {book.asks.reduce((sum, a) => sum + parseFloat(a.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-destructive" style={{ width: "52%" }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Orderbook is well-balanced with good depth on both sides
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Market Depth Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    ...book.bids.reverse().map((b, i) => ({
                      price: parseFloat(b.price),
                      bidDepth: book.bids.slice(0, i + 1).reduce((sum, bid) => sum + parseFloat(bid.quantity), 0),
                      askDepth: null
                    })),
                    ...book.asks.map((a, i) => ({
                      price: parseFloat(a.price),
                      askDepth: book.asks.slice(0, i + 1).reduce((sum, ask) => sum + parseFloat(ask.quantity), 0),
                      bidDepth: null
                    }))
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="price"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="bidDepth"
                      stroke="hsl(var(--success))"
                      fill="hsl(var(--success) / 0.2)"
                      strokeWidth={2}
                    />
                    <Area
                      type="stepBefore"
                      dataKey="askDepth"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

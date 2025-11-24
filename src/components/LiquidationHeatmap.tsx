import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface LiquidationBucket {
    price: number;
    volume: number;
    count: number;
}

interface HeatmapData {
    ticker: string;
    totalVolume: number;
    buckets: LiquidationBucket[];
    updatedAt: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export function LiquidationHeatmap() {
    const [data, setData] = useState<HeatmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/markets/liquidations`);
                if (!response.ok) throw new Error('Failed to fetch liquidation data');

                const json = await response.json();
                if (json.success) {
                    setData(json.data);
                } else {
                    throw new Error(json.error || 'Unknown error');
                }
            } catch (err) {
                console.error("Error fetching heatmap:", err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card className="w-full h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading Liquidation Heatmap...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full h-[400px] flex items-center justify-center border-destructive/50">
                <div className="text-center space-y-2">
                    <p className="text-destructive font-medium">Failed to load heatmap</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </Card>
        );
    }

    if (!data || data.buckets.length === 0) {
        return (
            <Card className="w-full h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">No significant liquidation clusters found.</p>
            </Card>
        );
    }

    // Calculate max volume for color scaling
    const maxVol = Math.max(...data.buckets.map(b => b.volume));

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Liquidation Heatmap
                            <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500 border-blue-500/20">
                                {data.ticker}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Potential liquidation clusters based on open positions.
                            Total Volume at Risk: <span className="text-foreground font-medium">${(data.totalVolume / 1e6).toFixed(2)}M</span>
                        </CardDescription>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Updated: {new Date(data.updatedAt).toLocaleTimeString()}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.buckets} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="price"
                                stroke="#888"
                                tickFormatter={(val) => `$${val}`}
                                label={{ value: 'Price (USDT)', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                                stroke="#888"
                                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                formatter={(value: number) => [`$${(value).toLocaleString()}`, 'Liquidation Vol']}
                                labelFormatter={(label) => `Price: $${label}`}
                            />
                            <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                                {data.buckets.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.volume > maxVol * 0.7 ? '#ef4444' : entry.volume > maxVol * 0.4 ? '#f97316' : '#eab308'}
                                        fillOpacity={0.8}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500/80"></div>
                        <span>Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500/80"></div>
                        <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500/80"></div>
                        <span>Critical Cluster</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from 'date-fns';

interface WhaleTransaction {
    timestamp: number;
    type: 'transfer' | 'trade' | 'unknown';
    amount: string;
    amountUSD: number;
    direction: 'inbound' | 'outbound';
    txHash: string;
}

interface Whale {
    address: string;
    label: string;
    type: 'exchange' | 'foundation' | 'whale' | 'fund';
    recentActivity: WhaleTransaction[];
}

interface WhaleActivityData {
    whales: Whale[];
    totalTracked: number;
    updatedAt: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export function WhaleActivity() {
    const [data, setData] = useState<WhaleActivityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/whales/activity`);
                if (!response.ok) throw new Error('Failed to fetch whale activity');

                const json = await response.json();
                if (json.success) {
                    setData(json.data);
                } else {
                    throw new Error(json.error || 'Unknown error');
                }
            } catch (err) {
                console.error("Error fetching whale activity:", err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // No auto-refresh per user request
    }, []);

    if (loading) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p>Loading Whale Activity...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full border-destructive/50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                        <p className="text-destructive font-medium">Failed to load whale activity</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.whales.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>🐋 Whale Activity</CardTitle>
                    <CardDescription>No recent whale activity detected</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Flatten all transactions with whale info
    const allActivity = data.whales.flatMap(whale =>
        whale.recentActivity.map(tx => ({ whale, tx }))
    ).sort((a, b) => b.tx.timestamp - a.tx.timestamp);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            🐋 Whale Activity
                            <Badge variant="outline" className="ml-2">
                                {data.whales.length} Active
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Tracking {data.totalTracked} whale wallets • Updated {format(data.updatedAt, 'h:mm a')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {allActivity.slice(0, 10).map((item, index) => {
                        const { whale, tx } = item;
                        const isInbound = tx.direction === 'inbound';
                        const amountINJ = (parseFloat(tx.amount) / 1e18).toFixed(0);
                        const amountUSD = tx.amountUSD.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                        });

                        return (
                            <div
                                key={`${tx.txHash}-${index}`}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                {/* Icon */}
                                <div className={`p-2 rounded-full ${isInbound ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    {isInbound ? (
                                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium truncate">{whale.label}</span>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {whale.type}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className={isInbound ? 'text-red-500' : 'text-green-500'}>
                                            {isInbound ? '↓ Deposit' : '↑ Withdrawal'}
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono">{amountINJ} INJ</span>
                                        <span className="text-foreground font-medium">({amountUSD})</span>
                                    </div>

                                    <div className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(tx.timestamp), 'MMM d, h:mm a')}
                                    </div>
                                </div>

                                {/* Amount Badge */}
                                <div className="flex flex-col items-end gap-1">
                                    {tx.amountUSD > 1000000 && (
                                        <Badge variant="destructive" className="text-xs">
                                            LARGE
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {allActivity.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No recent whale activity in the last 24 hours
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Wallet, Clock, DollarSign, Activity } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { DataFilters } from "@/components/DataFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  hash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
  gasUsed: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    // TODO: Replace with real RPC-backed transaction monitoring
    const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
      hash: `0x${Math.random().toString(16).slice(2, 18)}...${Math.random()
        .toString(16)
        .slice(2, 6)}`,
      type: ["Transfer", "Swap", "Stake", "Unstake", "Vote"][
        Math.floor(Math.random() * 5)
      ],
      from: `inj1${Math.random().toString(36).slice(2, 12)}`,
      to: `inj1${Math.random().toString(36).slice(2, 12)}`,
      amount: (Math.random() * 10000).toFixed(2),
      token: ["INJ", "USDT", "ATOM", "ETH"][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      status: ["success", "success", "success", "pending", "failed"][
        Math.floor(Math.random() * 5)
      ] as "success" | "pending" | "failed",
      gasUsed: (Math.random() * 100000).toFixed(0),
    }));

    setTransactions(mockTransactions);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.token.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDateRange =
        (!dateRange.from || tx.timestamp >= dateRange.from) &&
        (!dateRange.to || tx.timestamp <= dateRange.to);

      return matchesSearch && matchesDateRange;
    });
  }, [transactions, searchQuery, dateRange]);

  const totalVolume = transactions
    .filter(tx => tx.status === "success")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const successRate = transactions.length > 0
    ? (transactions.filter(tx => tx.status === "success").length / transactions.length) * 100
    : 0;

  const uniqueWallets = new Set([...transactions.map(tx => tx.from), ...transactions.map(tx => tx.to)]).size;

  const avgGasUsed = transactions.length > 0
    ? transactions.reduce((sum, tx) => sum + parseFloat(tx.gasUsed), 0) / transactions.length
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-success/20 text-success hover:bg-success/30">Success</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Transfer":
        return <ArrowUpRight className="h-4 w-4 text-primary" />;
      case "Swap":
        return <RefreshCw className="h-4 w-4 text-accent" />;
      default:
        return <Wallet className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction Monitoring</h1>
          <p className="text-muted-foreground">Real-time transaction tracking and wallet activity</p>
        </div>
        <ExportButton data={filteredTransactions} filename="transactions-data" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Volume"
          value={`$${(totalVolume / 1000).toFixed(2)}K`}
          icon={DollarSign}
          change="Last 24 hours"
          trend="up"
        />
        <MetricCard
          title="Transaction Count"
          value={filteredTransactions.length}
          icon={Activity}
          change="Real-time"
          trend="up"
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          icon={Clock}
          change={`${transactions.filter(tx => tx.status === "pending").length} pending`}
          trend={successRate > 95 ? "up" : "neutral"}
        />
        <MetricCard
          title="Unique Wallets"
          value={uniqueWallets}
          icon={Wallet}
          change="Active addresses"
          trend="neutral"
        />
      </div>

      <DataFilters
        searchPlaceholder="Search by hash, address, type, or token..."
        onSearchChange={setSearchQuery}
        onDateRangeChange={setDateRange}
        showDateRange={true}
      />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gas Used</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="font-medium">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{tx.hash}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.from}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.to}
                      </TableCell>
                      <TableCell className="font-medium">
                        {parseFloat(tx.amount).toLocaleString()} {tx.token}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {parseInt(tx.gasUsed).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleTimeString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Type Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Transfer", "Swap", "Stake", "Unstake", "Vote"].map((type) => {
                const count = filteredTransactions.filter(tx => tx.type === type).length;
                const percentage = filteredTransactions.length > 0 
                  ? (count / filteredTransactions.length) * 100 
                  : 0;
                
                return (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {getTypeIcon(type)}
                        {type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Tokens by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["INJ", "USDT", "ATOM", "ETH"].map((token, index) => {
                const volume = filteredTransactions
                  .filter(tx => tx.token === token && tx.status === "success")
                  .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
                
                const maxVolume = Math.max(
                  ...["INJ", "USDT", "ATOM", "ETH"].map(t =>
                    filteredTransactions
                      .filter(tx => tx.token === t && tx.status === "success")
                      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                  )
                );
                
                const percentage = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
                
                return (
                  <div key={token}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{token}</span>
                      <span className="text-sm text-muted-foreground">
                        ${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: `hsl(var(--chart-${index + 1}))`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gas Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Average Gas Used</div>
              <div className="text-2xl font-bold">{avgGasUsed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Max Gas Used</div>
              <div className="text-2xl font-bold">
                {Math.max(...transactions.map(tx => parseFloat(tx.gasUsed))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Min Gas Used</div>
              <div className="text-2xl font-bold">
                {Math.min(...transactions.map(tx => parseFloat(tx.gasUsed))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

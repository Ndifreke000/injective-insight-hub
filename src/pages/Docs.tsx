import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Box, 
  BookOpen, 
  TrendingUp, 
  PieChart, 
  AlertTriangle, 
  Activity, 
  Building2, 
  Coins,
  HelpCircle,
  Zap,
  Shield
} from "lucide-react";

const sections = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    description: "Your central hub for Injective network analytics. View real-time metrics including INJ price, 24h trading volume, total value locked, and network activity at a glance."
  },
  {
    title: "Blocks & Transactions",
    icon: Box,
    description: "Monitor the latest blocks on the Injective blockchain. Track block height, transaction counts, gas usage, and network throughput in real-time."
  },
  {
    title: "Orderbook & Liquidity",
    icon: BookOpen,
    description: "Analyze market depth and liquidity across Injective DEX markets. View bid/ask spreads, order distribution, and liquidity metrics for informed trading decisions."
  },
  {
    title: "Trading Activity",
    icon: TrendingUp,
    description: "Track trading volume, market activity, and trade history across all Injective markets. Monitor market trends and trading patterns."
  },
  {
    title: "Derivatives",
    icon: PieChart,
    description: "Explore perpetual futures and derivatives markets on Injective. View open interest, funding rates, and derivatives-specific metrics."
  },
  {
    title: "Risk & Liquidations",
    icon: AlertTriangle,
    description: "Monitor liquidation events and risk metrics across the network. Track at-risk positions and understand market health indicators."
  },
  {
    title: "Risk Heatmap",
    icon: Activity,
    description: "Visual representation of risk levels across different markets and positions. Quickly identify areas of concern with color-coded risk indicators."
  },
  {
    title: "Exchange Markets",
    icon: Building2,
    description: "Browse all available spot and derivative markets on Injective. Compare market metrics, trading pairs, and market status."
  },
  {
    title: "Staking",
    icon: Coins,
    description: "View staking statistics, validator information, and delegation metrics. Track staking rewards and network security metrics."
  }
];

const features = [
  {
    icon: Zap,
    title: "Real-Time Data",
    description: "All metrics are fetched directly from Injective RPC endpoints, providing you with live blockchain data."
  },
  {
    icon: Shield,
    title: "Data Export",
    description: "Export any data table to CSV format for further analysis. Exports are stored in your history for easy access."
  },
  {
    icon: HelpCircle,
    title: "Manual Refresh",
    description: "Use the refresh buttons on each page to update data on demand. This gives you control over when data is fetched."
  }
];

export default function Docs() {
  return (
    <div className="p-6 pt-8 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Documentation</h1>
        <p className="text-muted-foreground">
          Learn how to use Injective Intelligence to monitor and analyze the Injective blockchain.
        </p>
      </div>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pages Guide */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Pages Guide</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <section.icon className="h-4 w-4 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium text-foreground">Tips</h2>
        <Card className="bg-card border-border">
          <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">Navigation:</strong> Use the sidebar to navigate between different analytics pages. Collapse it for more screen space.</p>
            <p>• <strong className="text-foreground">Dark/Light Mode:</strong> Toggle between themes using the sun/moon icon in the sidebar header.</p>
            <p>• <strong className="text-foreground">Data Freshness:</strong> Click refresh buttons to fetch the latest data from the blockchain.</p>
            <p>• <strong className="text-foreground">Export Data:</strong> Look for export buttons on tables to download data as CSV files.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

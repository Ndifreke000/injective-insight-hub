const RPC_URL = "https://sentry.tm.injective.network:443";

export interface BlockData {
  height: string;
  hash: string;
  timestamp: string;
  validator: string;
  txCount: number;
  gasUsed: string;
}

export interface MetricsData {
  blockHeight: number;
  totalTransactions: number;
  activeValidators: number;
  tps: number;
  avgBlockTime: number;
  totalStaked: string;
  openInterest: string;
  insuranceFund: string;
  liquidationVolume24h: string;
  spotVolume24h: string;
  derivativesVolume24h: string;
  uniqueTraders24h: number;
  ibcInflows24h: string;
  ibcOutflows24h: string;
}

export interface OrderbookData {
  market: string;
  bestBid: string;
  bestAsk: string;
  spread: string;
  bids: Array<{ price: string; quantity: string }>;
  asks: Array<{ price: string; quantity: string }>;
}

export interface DerivativeData {
  market: string;
  openInterest: string;
  fundingRate: string;
  markPrice: string;
  oraclePrice: string;
  leverage: string;
}

export interface LiquidationEvent {
  timestamp: string;
  market: string;
  size: string;
  price: string;
  type: "long" | "short";
}

export interface CrossChainFlow {
  chain: string;
  inflow: string;
  outflow: string;
  netFlow: string;
  topAsset: string;
}

export interface RiskMetric {
  category: string;
  level: "low" | "medium" | "high";
  score: number;
  description: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  status: "active" | "passed" | "rejected";
  votesFor: string;
  votesAgainst: string;
  endTime: string;
}

// Simulated RPC calls with mock data for demonstration
// In production, these would make actual RPC calls to the Injective network

export async function fetchLatestBlock(): Promise<BlockData> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    height: String(Math.floor(Math.random() * 1000000) + 50000000),
    hash: "0x" + Math.random().toString(16).substring(2, 66),
    timestamp: new Date().toISOString(),
    validator: "injvaloper1..." + Math.random().toString(36).substring(7),
    txCount: Math.floor(Math.random() * 200) + 50,
    gasUsed: String(Math.floor(Math.random() * 10000000) + 1000000)
  };
}

export async function fetchMetrics(): Promise<MetricsData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    blockHeight: Math.floor(Math.random() * 1000000) + 50000000,
    totalTransactions: Math.floor(Math.random() * 10000000) + 100000000,
    activeValidators: Math.floor(Math.random() * 20) + 80,
    tps: Math.floor(Math.random() * 50) + 10,
    avgBlockTime: 0.7 + Math.random() * 0.3,
    totalStaked: (Math.random() * 50000000 + 50000000).toFixed(2),
    openInterest: (Math.random() * 100000000 + 500000000).toFixed(2),
    insuranceFund: (Math.random() * 10000000 + 20000000).toFixed(2),
    liquidationVolume24h: (Math.random() * 5000000 + 1000000).toFixed(2),
    spotVolume24h: (Math.random() * 100000000 + 200000000).toFixed(2),
    derivativesVolume24h: (Math.random() * 200000000 + 500000000).toFixed(2),
    uniqueTraders24h: Math.floor(Math.random() * 5000) + 10000,
    ibcInflows24h: (Math.random() * 50000000 + 20000000).toFixed(2),
    ibcOutflows24h: (Math.random() * 40000000 + 15000000).toFixed(2)
  };
}

export async function fetchOrderbooks(): Promise<OrderbookData[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const markets = ["INJ/USDT", "BTC/USDT", "ETH/USDT", "ATOM/USDT"];
  return markets.map(market => {
    const basePrice = Math.random() * 100 + 20;
    return {
      market,
      bestBid: basePrice.toFixed(2),
      bestAsk: (basePrice * 1.001).toFixed(2),
      spread: ((basePrice * 0.001).toFixed(4)),
      bids: Array(10).fill(0).map((_, i) => ({
        price: (basePrice * (1 - i * 0.001)).toFixed(2),
        quantity: (Math.random() * 10000 + 1000).toFixed(2)
      })),
      asks: Array(10).fill(0).map((_, i) => ({
        price: (basePrice * (1 + i * 0.001)).toFixed(2),
        quantity: (Math.random() * 10000 + 1000).toFixed(2)
      }))
    };
  });
}

export async function fetchDerivatives(): Promise<DerivativeData[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const markets = ["BTC-PERP", "ETH-PERP", "INJ-PERP", "ATOM-PERP"];
  return markets.map(market => {
    const price = Math.random() * 50000 + 10000;
    return {
      market,
      openInterest: (Math.random() * 100000000 + 50000000).toFixed(2),
      fundingRate: ((Math.random() - 0.5) * 0.01).toFixed(6),
      markPrice: price.toFixed(2),
      oraclePrice: (price * (1 + (Math.random() - 0.5) * 0.001)).toFixed(2),
      leverage: (Math.random() * 10 + 5).toFixed(1)
    };
  });
}

export async function fetchLiquidations(): Promise<LiquidationEvent[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Array(20).fill(0).map(() => ({
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    market: ["BTC-PERP", "ETH-PERP", "INJ-PERP"][Math.floor(Math.random() * 3)],
    size: (Math.random() * 100000 + 10000).toFixed(2),
    price: (Math.random() * 50000 + 10000).toFixed(2),
    type: Math.random() > 0.5 ? "long" : "short"
  }));
}

export async function fetchCrossChainFlows(): Promise<CrossChainFlow[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const chains = ["Cosmos", "Osmosis", "Ethereum", "Solana", "Arbitrum"];
  return chains.map(chain => {
    const inflow = Math.random() * 10000000 + 1000000;
    const outflow = Math.random() * 8000000 + 1000000;
    return {
      chain,
      inflow: inflow.toFixed(2),
      outflow: outflow.toFixed(2),
      netFlow: (inflow - outflow).toFixed(2),
      topAsset: ["USDT", "USDC", "ATOM", "ETH"][Math.floor(Math.random() * 4)]
    };
  });
}

export async function fetchRiskMetrics(): Promise<RiskMetric[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const riskLevels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  return [
    {
      category: "Oracle Health",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "Price feed reliability and deviation"
    },
    {
      category: "Liquidation Risk",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "Open positions at risk of liquidation"
    },
    {
      category: "Liquidity Depth",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "Market depth and slippage risk"
    },
    {
      category: "Cross-Chain",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "IBC bridge stability and flow"
    },
    {
      category: "Insurance Fund",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "Protocol solvency buffer"
    },
    {
      category: "Volatility",
      level: riskLevels[Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      description: "Market volatility levels"
    }
  ];
}

export async function fetchGovernanceProposals(): Promise<GovernanceProposal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return Array(5).fill(0).map((_, i) => ({
    id: String(i + 100),
    title: `Proposal ${i + 100}: Network Upgrade`,
    status: ["active", "passed", "rejected"][Math.floor(Math.random() * 3)] as any,
    votesFor: (Math.random() * 50000000 + 10000000).toFixed(0),
    votesAgainst: (Math.random() * 20000000 + 1000000).toFixed(0),
    endTime: new Date(Date.now() + Math.random() * 604800000).toISOString()
  }));
}

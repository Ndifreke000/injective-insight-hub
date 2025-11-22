# Injective Insight Hub

> Real-time blockchain analytics and intelligence platform for the Injective Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg)](https://vitejs.dev/)

## 🎯 Overview

Injective Insight Hub is a comprehensive analytics platform providing real-time insights into the Injective blockchain. Built with React, TypeScript, and the Injective SDK, it offers live monitoring of blocks, transactions, orderbooks, derivatives markets, staking metrics, and risk analysis.

**Live Demo**: [Coming Soon]

## ✨ Features

### ✅ Currently Working (Real-time RPC Data)

| Feature | Description | Data Source |
|---------|-------------|-------------|
| **Blocks & Transactions** | Real-time block explorer with gas tracking, TPS monitoring, and transaction analysis | Tendermint RPC |
| **Orderbook & Liquidity** | Live bid/ask prices for BTC, ETH, BNB, INJ perpetual markets with spread analysis | Indexer API |
| **Risk Metrics** | Dynamic risk calculations from 71 derivative markets including oracle health, liquidation risk, and volatility | Market Data |
| **Trading Activity** | Funding rates, open interest, and leverage metrics across perpetual markets | Indexer API |
| **Risk Heatmap** | System-wide risk visualization and monitoring dashboard | Calculated |

### ⚠️ Limited Features (CORS Restrictions)

| Feature | Status | Limitation |
|---------|--------|------------|
| **Staking Metrics** | Partial | Shows total staked ($100M) but validator count uses fallback due to gRPC CORS |
| **Insurance Fund** | Blocked | Returns $0 - API endpoint blocked by CORS policy |
| **Markets Page** | Blocked | Full market listings unavailable due to gRPC restrictions |
| **Governance** | Not Implemented | Would require CORS-enabled gRPC access |

## 🚨 Current Limitations

### CORS Policy Restrictions

Injective's public gRPC endpoints (`publicnode.com`, `sentry.grpc.injective.network`) are configured for backend/server use and **block browser requests** due to CORS (Cross-Origin Resource Sharing) policies.

**Affected APIs**:
- `ChainGrpcStakingApi` - Validator data
- `IndexerGrpcInsuranceFundApi` - Insurance fund balance
- `IndexerGrpcDerivativesApi` - Complete market listings

**Console Error**:
```
Access to fetch at 'https://injective-grpc.publicnode.com/...' 
from origin 'http://localhost:8082' has been blocked by CORS policy
```

**This is NOT a bug in our code** - it's an infrastructure limitation of free public RPCs.

## 💰 Cost & Infrastructure Options

### Option 1: Backend Proxy (Recommended) - $5-20/month

Build a lightweight backend server to proxy gRPC requests and bypass CORS:

```
Browser → Your Backend (Node.js/Express) → Injective Public RPCs → Data
```

**Pros**:
- ✅ FREE RPC usage (public endpoints)
- ✅ Full feature access
- ✅ Add caching to reduce load
- ✅ Complete control

**Cons**:
- ❌ 2-3 days development time
- ❌ Requires hosting ($5-20/mo on Railway/Vercel)

**Implementation**: ~100-200 lines of Express code

### Option 2: Paid RPC with CORS - $49-199/month

Use a paid RPC provider that supports browser CORS:

**Providers**:
- **GetBlock**: $49/mo (100K requests/day)
- **QuickNode**: $9-299/mo (tiered)
- **Ankr**: $20-100/mo

**Pros**:
- ✅ Zero dev work
- ✅ Direct browser access
- ✅ Better uptime & speed

**Cons**:
- ❌ Monthly subscription cost
- ❌ Vendor lock-in

### Option 3: Stay Free - $0/month

Accept current limitations and focus on working features.

**Good for**: Demo, portfolio, MVP

## 📊 Feature Completeness by Cost Tier

| Tier | Cost/Month | Features | Validator Data | Insurance Fund | Full Markets |
|------|------------|----------|----------------|----------------|--------------|
| **Free (Current)** | $0 | 70% | ❌ Fallback | ❌ $0 | ❌ Limited |
| **Backend Proxy** | $5-20 | 100% | ✅ Real | ✅ Real | ✅ Complete |
| **Paid RPC** | $49-199 | 100% | ✅ Real | ✅ Real | ✅ Complete |
| **Hybrid** | $54-219 | 100%+ | ✅ Real | ✅ Real | ✅ Complete |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/injective-insight-hub.git
cd injective-insight-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8082`

### Build for Production

```bash
npm run build
```

## 🗺️ Development Roadmap

### Phase 1: Current (FREE) ✅
- [x] Block & transaction explorer
- [x] Orderbook analysis
- [x] Risk metrics calculations
- [x] Data source indicators
- [x] Real-time gas tracking

### Phase 2: Backend Proxy ($5-20/mo)
- [ ] Express/FastAPI backend server
- [ ] gRPC proxy endpoints
- [ ] Response caching (Redis)
- [ ] Deploy on Railway/Vercel
- [ ] Unlock all blocked features

### Phase 3: Production ($49-99/mo)
- [ ] Paid RPC integration (GetBlock)
- [ ] User authentication (Supabase)
- [ ] Saved dashboards
- [ ] Real-time notifications
- [ ] Custom alerts

### Phase 4: Scale ($200-500/mo)
- [ ] Historical data indexer
- [ ] Advanced analytics
- [ ] Custom metrics builder
- [ ] Public API
- [ ] Mobile app

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Recharts
- **Blockchain**: Injective SDK, Tendermint RPC
- **State**: React Query, Context API
- **Routing**: React Router v6

## 📁 Project Structure

```
injective-insight-hub/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components (Blocks, Risk, etc.)
│   ├── lib/           # RPC clients, utilities
│   ├── contexts/      # React contexts (Theme)
│   └── types/         # TypeScript definitions
├── public/            # Static assets
└── package.json
```

## 🔧 Configuration

### RPC Endpoints

Configured in `src/lib/rpc-manager.ts`:

```typescript
{
  name: 'PublicNode',
  grpcUrl: 'https://injective-grpc.publicnode.com:443',
  restUrl: 'https://injective-rpc.publicnode.com:443'
}
```

To use a paid RPC, update these URLs with your provider's endpoints.

## 📝 Data Sources

### Working (Public RPCs)
- **Tendermint RPC**: Block data, transactions, gas metrics
- **Indexer API**: Orderbook prices, some market data
- **Calculated**: Risk scores, TPS, bonding ratio

### Blocked (Need Backend/Paid RPC)
- **ChainGrpc APIs**: Staking, governance, bank balances
- **Insurance API**: Fund balance and coverage
- **Full Derivatives**: Complete market listings

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Injective Protocol](https://injective.com) - Blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Vite](https://vitejs.dev) - Build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/injective-insight-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/injective-insight-hub/discussions)

---

**Note**: This project currently uses free public RPCs with known CORS limitations. See the "Cost & Infrastructure Options" section above for solutions to unlock 100% functionality.

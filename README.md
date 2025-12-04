# Injective Insight Hub

> Real-time blockchain analytics and intelligence platform for the Injective Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg)](https://vitejs.dev/)

**Live Demo**: [https://v0-injective-intelligence-platform.vercel.app/](https://v0-injective-intelligence-platform.vercel.app/)

## 🎯 Overview

Injective Insight Hub is a comprehensive analytics platform providing real-time insights into the Injective blockchain ecosystem. Built with modern web technologies and the Injective SDK, it delivers professional-grade blockchain intelligence through an intuitive interface.

## ✨ Features

### 📊 Real-Time Analytics

- **Block Explorer** - Live block monitoring with gas tracking and TPS metrics
- **Transaction Analysis** - Real-time transaction flow and network activity
- **Price Tracking** - INJ token price with 24h change and market data
- **Market Overview** - Trading volume and open interest across all markets

### 🔍 Advanced Monitoring

- **Derivatives Markets** - Track perpetual futures and derivatives trading
- **Spot Markets** - Monitor spot trading activity and liquidity
- **Orderbook Analysis** - Live bid/ask spreads for major trading pairs (BTC, ETH, BNB, INJ)
- **Risk Metrics** - Dynamic risk calculations from 71+ derivative markets

### 🛡️ Network Health

- **Validator Tracking** - Monitor active validators and staking metrics
- **Insurance Fund** - Track protocol insurance fund balance
- **Liquidation Heatmap** - Visualize liquidation risk clusters
- **Oracle Health** - Monitor price oracle reliability

### 📈 Data Visualization

- **Interactive Charts** - Recharts-powered visualizations
- **Risk Heatmaps** - Color-coded risk level indicators
- **Real-time Updates** - Auto-refreshing data streams
- **Dark Mode** - Professional dark theme optimized for trading

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **React Query** - Powerful data fetching and caching

### Backend
- **Express** - Node.js web framework
- **Injective SDK** - Official Injective Protocol SDK
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Reliable data storage

### Infrastructure
- **Vercel** - Frontend and serverless API hosting
- **Neon** - Serverless PostgreSQL database
- **CoinGecko API** - Cryptocurrency price data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Ndifreke000/injective-insight-hub.git
cd injective-insight-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8082`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend URL (for production)
VITE_BACKEND_URL=https://your-backend-url.vercel.app

# Optional: Supabase (for data exports)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📁 Project Structure

```
injective-insight-hub/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and helpers
│   ├── contexts/      # React contexts
│   └── types/         # TypeScript definitions
├── api/               # Vercel serverless functions
├── backend/           # Express backend server
├── prisma/            # Database schema
└── public/            # Static assets
```

## 🎨 Key Pages

- **Dashboard** - Overview of key metrics and network health
- **Blocks** - Real-time block explorer
- **Risk Analysis** - Comprehensive risk monitoring
- **Trading Activity** - Market volume and open interest
- **Derivatives** - Perpetual futures tracking
- **Orderbook** - Live order book analysis
- **Staking** - Validator and staking information

## 🔗 API Endpoints

The platform uses serverless functions deployed on Vercel:

- `/api/price/inj` - INJ token price data
- `/api/validators` - Active validator information
- `/api/insurance-fund` - Insurance fund balance
- `/api/markets/derivatives` - Derivative market data
- `/api/markets/spot` - Spot market data
- `/api/markets/volume` - 24h trading volume
- `/api/markets/open-interest` - Open interest metrics

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development status and roadmap
- Known issues and limitations
- How to contribute
- Code style guidelines

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Injective Protocol](https://injective.com) - Blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Vite](https://vitejs.dev) - Build tooling
- [Vercel](https://vercel.com) - Hosting platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Ndifreke000/injective-insight-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ndifreke000/injective-insight-hub/discussions)

---

Built with ❤️ for the Injective ecosystem

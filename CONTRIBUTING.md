# Contributing to Injective Insight Hub

Thank you for your interest in contributing to Injective Insight Hub! This document provides information about the project's current status, known issues, and how you can help.

## 📊 Current Status

**Last Updated**: December 4, 2025 (17:02 CET)

### ✅ Fully Operational (100%)

All core features are working and deployed:

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed (Vercel serverless functions)
- ✅ All API endpoints operational
- ✅ Database connected (Neon PostgreSQL)
- ✅ Real-time data flowing correctly
- ✅ CoinGecko API working (INJ price: $6.01)
- ✅ Validators endpoint fixed (shows 50 validators)
- ✅ Insurance fund working ($1T+ balance)

### 🎯 Recent Improvements

**Commit 0794dd8** (December 4, 2025):
- Fixed validator REST endpoint (changed to sentry.lcd.injective.network)
- Improved error logging for CoinGecko API calls
- Resolved 404 errors when fetching validators
- Fixed validators showing 100 instead of actual 50

## 🚧 Known Limitations

### CORS Restrictions

Some Injective public gRPC endpoints (`publicnode.com`, `sentry.grpc.injective.network`) are configured for backend/server use and block browser requests due to CORS policies.

**Affected APIs** (now proxied through backend):
- `ChainGrpcStakingApi` - Validator data
- `IndexerGrpcInsuranceFundApi` - Insurance fund balance
- `IndexerGrpcDerivativesApi` - Complete market listings

**Status**: ✅ Resolved via backend proxy

### API Rate Limits

**CoinGecko API**:
- Free tier: 10,000 requests/month, 30 requests/minute
- Current usage: Within limits
- Caching: 24 hours for price data, 5 minutes for stats

## 🗺️ Roadmap

### Phase 1: Core Features ✅ COMPLETE
- [x] Block & transaction explorer
- [x] Orderbook analysis
- [x] Risk metrics calculations
- [x] Data source indicators
- [x] Real-time gas tracking
- [x] Backend proxy for CORS bypass
- [x] Database integration

### Phase 2: Enhanced Features (In Progress)
- [ ] Historical data collection (cron job)
- [ ] Trend analysis charts
- [ ] Price history graphs
- [ ] Volume trends over time
- [ ] Validator performance tracking

### Phase 3: Advanced Analytics
- [ ] Custom alerts and notifications
- [ ] Whale wallet tracking
- [ ] Advanced risk modeling
- [ ] Portfolio tracking
- [ ] Trading signals

### Phase 4: Platform Expansion
- [ ] User authentication
- [ ] Saved dashboards
- [ ] Custom metrics builder
- [ ] Public API
- [ ] Mobile app

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- CoinGecko API key (free tier)

### Local Development

1. **Clone and Install**
```bash
git clone https://github.com/Ndifreke000/injective-insight-hub.git
cd injective-insight-hub
npm install
```

2. **Environment Variables**

Create `.env` in root:
```env
VITE_BACKEND_URL=http://localhost:3001
```

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
COINGECKO_API_KEY=your-api-key
INJECTIVE_GRPC_ENDPOINT=https://injective-grpc.publicnode.com:443
INJECTIVE_REST_ENDPOINT=https://sentry.lcd.injective.network:443
INJECTIVE_INDEXER_ENDPOINT=https://sentry.exchange.grpc-web.injective.network
DATABASE_URL=postgresql://user:password@host:5432/database
```

3. **Start Development Servers**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run start:backend
```

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio
npx prisma studio
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend compiles successfully (`cd backend && npm run build`)
- [ ] Health endpoint responds (`curl http://localhost:3001/health`)
- [ ] Price API returns data (`curl http://localhost:3001/api/price/inj`)
- [ ] Validators endpoint works (`curl http://localhost:3001/api/validators`)
- [ ] Insurance fund endpoint works (`curl http://localhost:3001/api/insurance-fund`)
- [ ] Database connection successful (`npx prisma db push`)

### Automated Tests (TODO)

We're looking for contributors to help add:
- Unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright)
- API endpoint tests

## 📝 Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` or proper types

### React

- Functional components with hooks
- Use React Query for data fetching
- Keep components focused and small
- Use proper TypeScript types for props

### File Organization

- Components: `src/components/`
- Pages: `src/pages/`
- Utilities: `src/lib/`
- Types: `src/types/`
- API functions: `api/` (Vercel) or `backend/src/` (Express)

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Description** - Clear description of the problem
2. **Steps to Reproduce** - How to reproduce the issue
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, Node version
6. **Screenshots** - If applicable
7. **Console Logs** - Any error messages

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Describe the feature clearly
3. Explain the use case
4. Suggest implementation approach (optional)

## 🔧 Areas Needing Help

### High Priority

1. **Data Collection Cron Job**
   - Set up automated data collection
   - Store historical metrics in database
   - Run every 5-15 minutes

2. **Test Coverage**
   - Add unit tests for utilities
   - Add integration tests for API endpoints
   - Add E2E tests for critical flows

3. **Performance Optimization**
   - Implement Redis caching
   - Optimize bundle size
   - Lazy load components

### Medium Priority

4. **Monitoring & Alerts**
   - Integrate Sentry for error tracking
   - Add uptime monitoring
   - Set up performance monitoring

5. **Documentation**
   - API documentation
   - Component documentation
   - Architecture diagrams

6. **UI/UX Improvements**
   - Mobile responsiveness
   - Accessibility improvements
   - Loading states

## 📊 Performance Targets

- **Frontend Bundle**: < 3MB (currently 2.4MB ✅)
- **API Response Time**: < 500ms average
- **Database Queries**: < 100ms average
- **Lighthouse Score**: > 90 (Performance, Accessibility, Best Practices)

## 🚀 Deployment

### Frontend (Vercel)

Automatic deployment on push to `main`:
```bash
git push origin main
```

Manual deployment:
```bash
vercel --prod
```

### Backend (Vercel Serverless)

Backend functions are deployed automatically with the frontend.

### Database (Neon)

Migrations are applied automatically via Prisma:
```bash
npx prisma migrate deploy
```

## 📚 Resources

- [Injective SDK Documentation](https://docs.injective.network/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'feat: Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Format

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Ndifreke000/injective-insight-hub/issues)
- **GitHub Discussions**: [Ask questions or discuss ideas](https://github.com/Ndifreke000/injective-insight-hub/discussions)

---

Thank you for contributing to Injective Insight Hub! 🚀

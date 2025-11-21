# RPC Data Availability - Quick Test Results

Based on the running test (still in progress), here's what we know:

## ✅ WORKING APIs

### 1. Derivatives Markets
- **Status**: ✅ Working perfectly
- **Data**: 71 derivative markets found
- **Available Fields**: 
  - oracleBase, oracleQuote, oracleType, oracleScaleFactor
  - initialMarginRatio, maintenanceMarginRatio, reduceMarginRatio
  - marketId, marketStatus, ticker, quoteDenom
  - makerFeeRate, takerFeeRate, serviceProviderFee
  - minPriceTickSize, minQuantityTickSize, minNotional
  - **perpetualMarketInfo, perpetualMarketFunding** ← Important!
  - expiryFuturesMarketInfo

### 2. Spot Markets  
- **Status**: ✅ Working perfectly
- **Data**: 138 spot markets found
- **Available Fields**:
  - marketId, marketStatus, ticker
  - baseDenom, quoteDenom, baseToken, quoteToken
  - makerFeeRate, takerFeeRate, serviceProviderFee
  - minPriceTickSize, minQuantityTickSize, minNotional

## ❌ ISSUES FOUND

### 1. Orderbook API
- **Status**: ❌ **DEPRECATED**
- **Error**: "deprecated - use fetchOrderbookV2"
- **Action Required**: Update code to use `fetchOrderbookV2` instead of `fetchOrderbook`

### 2. Validators/Staking API
- **Status**: ⏱️ **TIMING OUT / HANGING**
- **Issue**: Call to `fetchValidators()` hangs indefinitely
- **Action Required**: This confirms our earlier timeout issue - needs caching and better error handling

### 3. Pending Tests (not completed yet)
- Insurance Funds
- Governance Proposals
- Oracle Prices
- Transactions
- Bank/Supply

## 📋 ACTION PLAN

### Immediate Fixes Needed:

1. **Fix Orderbook API** - Change from deprecated `fetchOrderbook` to `fetchOrderbookV2`
2. **Keep Validator Caching** - The caching we added is critical since API hangs
3. **Test Remaining APIs** - Create faster targeted tests for:
   - Insurance funds (likely works)
   - Transactions (likely works)
   - Oracle prices (likely works)
   - Governance (might timeout like validators)

### Features to Keep (Have Real Data):
- ✅ Derivatives page - 71 real markets
- ✅ Spot Markets page - 138 real markets  
- ✅ Dashboard metrics (uses derivatives + spot data)
- ✅ Staking page (with caching we implemented)

### Features to Review/Remove:
- ❓ Cross-chain flows (need to test IBC data availability)
- ❓ Liquidation events (need transaction stream data)
- ❓ Governance proposals (need to test if API works)
- ❓ Risk metrics calculations (depends on oracle data availability)

## Next Steps:
1. Create faster targeted test for remaining APIs
2. Fix orderbook to use V2 API
3. Remove or replace features without real data sources

# 🚀 Vercel Deployment - Quick Start

## Step 1: Login to Vercel
```bash
vercel login
```
Follow the browser prompts to authenticate.

## Step 2: Deploy
```bash
vercel --prod
```

**Answer the prompts**:
- Set up and deploy? **YES**
- Which scope? Select your Vercel account
- Link to existing project? **NO**
- What's your project's name? **injective-insight-hub**
- In which directory is your code located? **./** (press Enter)
- Want to override the settings? **NO** (press Enter)

## Step 3: Note Your Deployment URL

After deployment completes, you'll see:
```
✅ Production: https://injective-insight-hub-xxx.vercel.app
```

**Copy this URL!**

## Step 4: Add Environment Variables

1. Go to https://vercel.com/dashboard
2. Click your project "injective-insight-hub"
3. Go to Settings → Environment Variables
4. Add these variables for **Production**:

```
COINGECKO_API_KEY=CG-Xt14fvyAWMvYBM9TBsoYWrGK
INJECTIVE_GRPC_ENDPOINT=https://injective-grpc.publicnode.com:443
INJECTIVE_REST_ENDPOINT=https://sentry.lcd.injective.network:443
INJECTIVE_INDEXER_ENDPOINT=https://sentry.exchange.grpc-web.injective.network
```

## Step 5: Update Frontend Environment

Update `.env.production` with your deployment URL:
```bash
echo "VITE_BACKEND_URL=https://your-app-url.vercel.app" > .env.production
```

## Step 6: Redeploy
```bash
vercel --prod
```

## Step 7: Test

Visit your deployment URL and verify:
- ✅ Insurance Fund shows ~$1T (not $0)
- ✅ Validators show 50+ (not 100)
- ✅ Volume shows ~$70M
- ✅ No console errors

## Done! 🎉

Your app is now live on Vercel with serverless backend functions!

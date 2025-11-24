-- CreateTable
CREATE TABLE "HistoricalMetric" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "HistoricalMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidationSnapshot" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marketTicker" TEXT NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "bucketCount" INTEGER NOT NULL,
    "criticalClusters" INTEGER NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "LiquidationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceUSD" DOUBLE PRECISION NOT NULL,
    "marketCap" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricalMetric_type_timestamp_idx" ON "HistoricalMetric"("type", "timestamp");

-- CreateIndex
CREATE INDEX "LiquidationSnapshot_marketTicker_timestamp_idx" ON "LiquidationSnapshot"("marketTicker", "timestamp");

-- CreateIndex
CREATE INDEX "PriceSnapshot_timestamp_idx" ON "PriceSnapshot"("timestamp");

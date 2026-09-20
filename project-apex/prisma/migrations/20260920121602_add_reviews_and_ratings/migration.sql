-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'PENDING', 'HIDDEN');

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" VARCHAR(5000) NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_helpful_vote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_report" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_productId_status_createdAt_idx" ON "review"("productId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "review_userId_createdAt_idx" ON "review"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_productId_key" ON "review"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_vote_reviewId_userId_key" ON "review_helpful_vote"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "review_report_reviewId_idx" ON "review_report"("reviewId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

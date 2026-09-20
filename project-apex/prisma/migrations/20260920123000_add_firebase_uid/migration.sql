-- AlterTable
ALTER TABLE "user" ADD COLUMN "firebaseUid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_firebaseUid_key" ON "user"("firebaseUid");

-- CreateIndex
CREATE INDEX "user_firebaseUid_idx" ON "user"("firebaseUid");

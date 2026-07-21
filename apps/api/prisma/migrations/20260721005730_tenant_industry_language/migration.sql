-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3);


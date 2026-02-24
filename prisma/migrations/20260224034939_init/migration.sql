-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('MANUFACTURING', 'RETAIL', 'SERVICE', 'FOOD', 'OTHER');

-- CreateTable
CREATE TABLE "ConsultationLead" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phonePrefix" TEXT NOT NULL DEFAULT '010',
    "phoneMiddle" VARCHAR(4) NOT NULL,
    "phoneLast" VARCHAR(4) NOT NULL,
    "phoneRaw" TEXT NOT NULL,
    "addressRoad" TEXT NOT NULL,
    "addressDetail" TEXT,
    "industry" "IndustryType" NOT NULL,
    "desiredAmountText" TEXT,
    "consentAgreedAt" TIMESTAMP(3) NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'netlify-landing',
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactedAt" TIMESTAMP(3),

    CONSTRAINT "ConsultationLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultationLead_createdAt_idx" ON "ConsultationLead"("createdAt");

-- CreateIndex
CREATE INDEX "ConsultationLead_status_createdAt_idx" ON "ConsultationLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ConsultationLead_phoneRaw_idx" ON "ConsultationLead"("phoneRaw");

-- CreateIndex
CREATE INDEX "ConsultationEvent_leadId_createdAt_idx" ON "ConsultationEvent"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "ConsultationEvent" ADD CONSTRAINT "ConsultationEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ConsultationLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

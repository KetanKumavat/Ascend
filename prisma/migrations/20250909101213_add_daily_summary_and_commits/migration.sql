-- CreateTable
CREATE TABLE "public"."Commit" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorEmail" TEXT,
    "commitDate" TIMESTAMP(3) NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "totalChanges" INTEGER,
    "additions" INTEGER,
    "deletions" INTEGER,
    "filesChanged" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommitReport" (
    "id" TEXT NOT NULL,
    "commitId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "impact" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailySummary" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "commitsCount" INTEGER NOT NULL,
    "totalAdditions" INTEGER,
    "totalDeletions" INTEGER,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commit_sha_key" ON "public"."Commit"("sha");

-- CreateIndex
CREATE INDEX "idx_commit_project_id" ON "public"."Commit"("projectId");

-- CreateIndex
CREATE INDEX "idx_commit_date" ON "public"."Commit"("commitDate");

-- CreateIndex
CREATE INDEX "idx_commit_sha" ON "public"."Commit"("sha");

-- CreateIndex
CREATE INDEX "idx_commit_project_date" ON "public"."Commit"("projectId", "commitDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommitReport_commitId_key" ON "public"."CommitReport"("commitId");

-- CreateIndex
CREATE INDEX "idx_commit_report_commit_id" ON "public"."CommitReport"("commitId");

-- CreateIndex
CREATE INDEX "idx_commit_report_generated_at" ON "public"."CommitReport"("generatedAt");

-- CreateIndex
CREATE INDEX "idx_daily_summary_project_id" ON "public"."DailySummary"("projectId");

-- CreateIndex
CREATE INDEX "idx_daily_summary_date" ON "public"."DailySummary"("date");

-- CreateIndex
CREATE INDEX "idx_daily_summary_project_date" ON "public"."DailySummary"("projectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_projectId_date_key" ON "public"."DailySummary"("projectId", "date");

-- AddForeignKey
ALTER TABLE "public"."Commit" ADD CONSTRAINT "Commit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommitReport" ADD CONSTRAINT "CommitReport_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "public"."Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailySummary" ADD CONSTRAINT "DailySummary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

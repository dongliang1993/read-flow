-- Jobs table for background task processing
CREATE TABLE IF NOT EXISTS "jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "payload" jsonb,
  "result" jsonb,
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "run_at" timestamp with time zone NOT NULL DEFAULT now(),
  "locked_at" timestamp with time zone,
  "locked_by" text,
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for polling pending jobs efficiently
CREATE INDEX IF NOT EXISTS "jobs_status_run_at_idx" ON "jobs" ("status", "run_at") WHERE "status" = 'pending';

-- Index for finding locked jobs by worker
CREATE INDEX IF NOT EXISTS "jobs_locked_by_idx" ON "jobs" ("locked_by") WHERE "locked_by" IS NOT NULL;


// Centralised environment-variable access. Throws early with a clear message
// instead of failing deep inside the Supabase/AI clients.

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

// Parses an integer env var, falling back to a default and clamping to bounds.
function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

// Parses a boolean env var ("true"/"false"/"1"/"0"); falls back when unset.
function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback;
  const v = raw.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () =>
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: () =>
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  storageBucket: () => process.env.SUPABASE_STORAGE_BUCKET || "traffic-sign-frames",
  aiModelApiUrl: () => process.env.AI_MODEL_API_URL || "",
  aiModelApiKey: () => process.env.AI_MODEL_API_KEY || "",
  aiModelMode: () => (process.env.AI_MODEL_MODE || "").toLowerCase(),
  aiModelTimeoutMs: () => clampInt(process.env.AI_MODEL_TIMEOUT_MS, 15000, 1000, 120000),
  aiModelMaxRetries: () => clampInt(process.env.AI_MODEL_MAX_RETRIES, 1, 0, 5),
  aiModelRetryBackoffMs: () => clampInt(process.env.AI_MODEL_RETRY_BACKOFF_MS, 500, 0, 10000),
  signedImageUrlTtl: () => clampInt(process.env.SIGNED_IMAGE_URL_TTL_SECONDS, 300, 30, 86400),
  aiFailureWarnPct: () => clampInt(process.env.AI_FAILURE_RATE_WARNING_PERCENT, 20, 1, 100),
  aiTimeseriesBucketMinutes: () => clampInt(process.env.AI_TIMESERIES_BUCKET_MINUTES, 60, 5, 1440),
  storageQuarantineGraceDays: () => clampInt(process.env.STORAGE_QUARANTINE_GRACE_DAYS, 7, 1, 90),
  storageReconMaxFolders: () => clampInt(process.env.STORAGE_RECONCILIATION_MAX_FOLDERS, 100, 10, 1000),
  storageReconMaxFilesPerFolder: () =>
    clampInt(process.env.STORAGE_RECONCILIATION_MAX_FILES_PER_FOLDER, 200, 20, 1000),
  storageQuarantineDeleteBatchLimit: () =>
    clampInt(process.env.STORAGE_QUARANTINE_DELETE_BATCH_LIMIT, 50, 1, 100),
  dashboardAnalyticsSource: () => {
    const v = (process.env.DASHBOARD_ANALYTICS_SOURCE || "auto").toLowerCase();
    return v === "rpc" || v === "fallback" ? v : "auto";
  },
  dailyMetricsDefaultDays: () => clampInt(process.env.DAILY_METRICS_DEFAULT_DAYS, 30, 7, 365),
  cronSecret: () => process.env.CRON_SECRET || "",
  cronDailyMetricsEnabled: () => parseBool(process.env.CRON_DAILY_METRICS_ENABLED, true),
  cronStorageReconciliationEnabled: () =>
    parseBool(process.env.CRON_STORAGE_RECONCILIATION_ENABLED, true),
  cronStorageReconMaxFolders: () =>
    clampInt(process.env.CRON_STORAGE_RECONCILIATION_MAX_FOLDERS, 60, 10, 1000),
  cronStorageReconMaxFilesPerFolder: () =>
    clampInt(process.env.CRON_STORAGE_RECONCILIATION_MAX_FILES_PER_FOLDER, 100, 20, 1000),
  snapshotGapWarningDays: () => clampInt(process.env.SNAPSHOT_GAP_WARNING_DAYS, 2, 1, 90),
  signMatchRadiusMeters: () => Number(process.env.SIGN_MATCH_RADIUS_METERS || "25"),
  minGroupingConfidence: () => Number(process.env.MIN_GROUPING_CONFIDENCE || "0.45"),
  isDev: () => process.env.NODE_ENV !== "production",
};

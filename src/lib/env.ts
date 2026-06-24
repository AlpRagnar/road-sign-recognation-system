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
  signMatchRadiusMeters: () => Number(process.env.SIGN_MATCH_RADIUS_METERS || "25"),
  minGroupingConfidence: () => Number(process.env.MIN_GROUPING_CONFIDENCE || "0.45"),
  isDev: () => process.env.NODE_ENV !== "production",
};

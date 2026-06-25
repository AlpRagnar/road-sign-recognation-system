import { timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

// SERVER-ONLY. Bearer-secret auth for headless cron endpoints.
// Never import into client components. Never logs or returns the secret.

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: 500 | 401; category: "config" | "auth"; message: string };

// Validates `Authorization: Bearer <CRON_SECRET>`. The secret is only ever
// accepted via the header — never via query string.
export function checkCronAuth(req: Request): CronAuthResult {
  const secret = env.cronSecret();
  if (!secret) {
    return {
      ok: false,
      status: 500,
      category: "config",
      message: "Cron endpoint is not configured (CRON_SECRET missing).",
    };
  }

  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  // Length check first (timingSafeEqual throws on length mismatch).
  const valid = a.length === b.length && timingSafeEqual(a, b);
  if (!valid) {
    return { ok: false, status: 401, category: "auth", message: "Invalid or missing bearer token." };
  }

  return { ok: true };
}

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

// Server-only signed-URL helpers for captured frames.
// The Storage bucket should be PRIVATE in production; callers must already have
// authorized the requester before signing. Never log the returned URLs.

function bucket(): string {
  return env.storageBucket();
}

/**
 * Resolves a stored value to a Storage object path.
 * - A bare path (no scheme) is returned as-is.
 * - A Supabase public/sign/authenticated URL has its object path extracted
 *   (backward compatibility for rows that stored a public URL).
 * - Any other absolute URL returns null (not in our bucket).
 */
export function extractStoragePathFromKnownValue(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value;
  const b = bucket();
  for (const marker of [
    `/object/public/${b}/`,
    `/object/sign/${b}/`,
    `/object/authenticated/${b}/`,
  ]) {
    const i = value.indexOf(marker);
    if (i >= 0) return decodeURIComponent(value.slice(i + marker.length).split("?")[0]!);
  }
  return null;
}

/**
 * Returns a short-lived signed URL for a stored path or legacy public URL.
 * Returns null when there is no usable image. Legacy absolute URLs that are
 * not in our bucket are passed through unchanged (last-resort compatibility).
 */
export async function createSignedFrameUrl(
  stored: string | null | undefined,
  expiresInSeconds: number = env.signedImageUrlTtl(),
): Promise<string | null> {
  if (!stored) return null;
  const path = extractStoragePathFromKnownValue(stored);
  if (!path) return /^https?:\/\//i.test(stored) ? stored : null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(bucket())
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

/**
 * Batch variant: signs many stored values in a single Storage round-trip where
 * possible. Preserves input order; entries with no resolvable path become null
 * (or pass through a legacy external URL).
 */
export async function createSignedFrameUrls(
  storedValues: Array<string | null | undefined>,
  expiresInSeconds: number = env.signedImageUrlTtl(),
): Promise<Array<string | null>> {
  const result: Array<string | null> = new Array(storedValues.length).fill(null);

  const pathIndex: number[] = [];
  const paths: string[] = [];

  storedValues.forEach((value, i) => {
    const path = extractStoragePathFromKnownValue(value);
    if (path) {
      pathIndex.push(i);
      paths.push(path);
    } else if (value && /^https?:\/\//i.test(value)) {
      result[i] = value; // legacy external URL passthrough
    }
  });

  if (paths.length === 0) return result;

  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage.from(bucket()).createSignedUrls(paths, expiresInSeconds);
  if (data) {
    data.forEach((entry, k) => {
      const targetIndex = pathIndex[k]!;
      result[targetIndex] = entry.error ? null : (entry.signedUrl ?? null);
    });
  }
  return result;
}

import { randomBytes } from "crypto";

// Server-only. Generates a strong temporary password. The result is returned
// to the admin exactly once and is NEVER stored in the database or logs.
const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";

export function generateTempPassword(length = 16): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[bytes[i]! % CHARSET.length];
  }
  return out;
}

// Minimal password policy for manually-entered admin passwords.
export function isAcceptablePassword(pw: string): boolean {
  return typeof pw === "string" && pw.length >= 8;
}

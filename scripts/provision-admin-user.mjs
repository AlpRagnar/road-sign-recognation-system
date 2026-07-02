#!/usr/bin/env node
/**
 * Idempotent Supabase admin-user provisioning (one-off operational script).
 *
 * Creates or updates a Supabase Auth user and ensures its profile role is
 * exactly "admin". Safe to re-run: an existing user is updated in place, never
 * duplicated.
 *
 * Credentials are NEVER hardcoded here — they are read from the environment at
 * runtime so nothing sensitive is committed:
 *   ADMIN_EMAIL     target email          (required)
 *   ADMIN_PASSWORD  temporary password    (required; never printed/logged)
 *   ADMIN_ROLE      "admin" | "user"      (optional, default "admin")
 *
 * Supabase connection is read from .env.local (or process.env):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/provision-admin-user.mjs
 *
 * The service-role key stays server-side; it is only used by this CLI script,
 * never shipped to the browser.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Minimal .env parser (does not override already-set process.env values).
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function fail(msg) {
  console.error(`[provision-admin] ${msg}`);
  process.exit(1);
}

async function findUserByEmail(admin, email) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const users = data?.users ?? [];
    const match = users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (match) return match;
    if (users.length < 200) break; // last page
  }
  return null;
}

async function main() {
  loadEnvFile(join(ROOT, ".env.local"));
  loadEnvFile(join(ROOT, ".env"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const role = (process.env.ADMIN_ROLE ?? "admin").trim();

  if (!url || !serviceKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in environment.");
  }
  if (!email) fail("ADMIN_EMAIL is required.");
  if (!password) fail("ADMIN_PASSWORD is required (passed via env, never committed).");
  if (role !== "admin" && role !== "user") fail('ADMIN_ROLE must be "admin" or "user".');

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let user = await findUserByEmail(admin, email);
  let created = false;

  if (user) {
    // Reset password + ensure email confirmed. Never create a duplicate.
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) fail(`Could not update existing auth user: ${error.message}`);
    user = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "CSJ Admin" },
    });
    if (error) fail(`Could not create auth user: ${error.message}`);
    user = data.user;
    created = true;
  }

  const authUserId = user.id;

  // Ensure the profile row exists and its role is exactly `role`.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existingProfile) {
    const { error } = await admin
      .from("profiles")
      .update({ role, email, updated_at: new Date().toISOString() })
      .eq("auth_user_id", authUserId);
    if (error) fail(`Auth user ready but profile update failed: ${error.message}`);
  } else {
    const { error } = await admin
      .from("profiles")
      .insert({ auth_user_id: authUserId, email, full_name: "CSJ Admin", role });
    if (error) fail(`Auth user ready but profile insert failed: ${error.message}`);
  }

  // Never print the password.
  console.log(
    `[provision-admin] ${created ? "Created" : "Updated"} ${email} — role=${role}, id=${authUserId}`,
  );
}

main().catch((err) => fail(err.message));

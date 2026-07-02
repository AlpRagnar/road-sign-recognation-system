# Class Mapping & Data Cleanup

This document covers four production changes:

1. Real traffic-sign class names (instead of `Sign 150`)
2. Permanent frame deletion (hard delete of an incorrect captured frame)
3. Device active-status behavior on session stop
4. Admin-only security controls for the above

No passwords or secrets are included here.

---

## 1. Traffic-sign class names

### Source of truth

```
classifier_index_classes_mapping.yaml   (project root)
```

A YAML file with a single root key `names:` mapping the 400 classifier class ids
(0–399) to their raw canonical labels, e.g.
`150: "regulatory--maximum-speed-limit-60--g1"`.

### Generated artifacts

A build-time generator converts the YAML into **two byte-identical JSON files**
(a flat `{ "<id>": "<Friendly Name>" }` map):

```
src/data/traffic-sign-classes.json   # consumed by the Next.js app
ai-server/classes.json               # consumed by the FastAPI wrapper
```

No YAML runtime dependency is added to the Next.js app — the generator parses
the simple YAML shape itself.

### Regenerating the mapping (after a model change)

```bash
npm run gen:classes          # regenerate both JSON artifacts
npm run gen:classes:check    # verify committed artifacts are up to date (CI-safe)
```

The generator (`scripts/generate-traffic-sign-class-map.mjs`) validates:

- root `names` key exists;
- exactly **400** mappings;
- ids **0–399** all present, no duplicates/gaps;
- every label is a non-empty string.

It fails loudly (non-zero exit) if any of these are violated or if the built-in
spot-check assertions (e.g. `150 → Maximum Speed Limit 60`) do not match.

After regenerating `ai-server/classes.json`, **restart the FastAPI wrapper** so
it reloads the map at startup.

### Friendly-label rules (humanization)

Applied to raw canonical labels such as `regulatory--maximum-speed-limit-60--g1`:

1. Split by `--`.
2. Drop the leading category token: `complementary`, `information`,
   `regulatory`, `warning`.
3. Drop the trailing regional/graphic variant token matching `^g\d+$`.
4. Join the remaining semantic tokens; replace hyphens with spaces.
5. Readable title case; numbers preserved.
6. Common-term tidy-ups: `u-turn → U-Turn`, `led → LED`, `y-roads → Y-Roads`,
   `t-roads → T-Roads`.
7. If conversion fails, fall back to the raw canonical label.
8. If there is no mapping for an id, fall back to `Sign {id}`.

The identical rules live in **two places, kept in sync**:

- `scripts/generate-traffic-sign-class-map.mjs` (`humanizeCanonicalLabel`)
- `src/lib/traffic-sign-classes.ts` (`humanizeCanonicalLabel`)

Verified assertions:

| id  | friendly name           |
| --- | ----------------------- |
| 123 | Keep Right              |
| 138 | Maximum Speed Limit 30  |
| 150 | Maximum Speed Limit 60  |
| 164 | No Entry                |
| 318 | Other Danger            |
| 354 | Roadworks               |
| 392 | Wild Animals            |

### Display resolver

`src/lib/traffic-sign-classes.ts`:

```ts
getTrafficSignDisplayName(
  classId: number | string | null,
  storedClassName?: string | null,
): string
```

Behavior:

- If `storedClassName` is already a meaningful (manually reviewed) name, it is
  **preserved** — never overwritten.
- If it is empty, a `Sign N` placeholder, or a raw `category--...--gN` canonical
  value, it is resolved: by `classId` when available; otherwise by the `N`
  embedded in `Sign N`; otherwise by humanizing the raw canonical string.
- Falls back to `Sign {id}` / the raw value / `Unknown sign`.

The friendly name is the **primary** displayed value everywhere; the numeric
class id remains available as secondary metadata on the detection detail page.

Applied to: dashboard recent detections + top sign types, Detection Review,
detection detail, detection logs, Sign Review, Sign Map dropdown + detail panel,
live detection result cards, the Admin AI self-test table, and both CSV exports
(a `class_display_name` / `sign_display_name` column is added while the raw
`detected_class_name` / `sign_type` column is kept for filter fidelity).

### Existing vs new records

- **Existing rows** stored as `Sign 150` (or a raw canonical) are resolved to the
  friendly name **at display time** — no destructive DB migration is required.
- **New rows** are stored with the friendly name: the frame ingestion route runs
  the resolver before persisting `detected_class_name`, so the inventory groups
  by and shows real names.

### FastAPI wrapper

`ai-server/main.py` loads `ai-server/classes.json` at startup:

- new inference responses return the friendly `class_name`;
- `class_id` is unchanged;
- missing/malformed mapping never prevents boot or inference — it falls back to
  `Sign {id}` and emits a safe startup warning (no absolute paths / secrets);
- example response: `{ "class_id": 150, "class_name": "Maximum Speed Limit 60", "confidence": 0.97 }`.

---

## 2. Permanent frame deletion

### Reject vs Delete frame

| Action           | Effect                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| **Reject**       | Review-status only. Sets `validation_status = 'rejected'`. **Keeps** the image, rows, and observations. Reversible. |
| **Delete frame** | **Permanent hard delete.** Removes the captured image, every detection produced from the same frame, related observation links, orphaned inventory signs, and the storage object. **Not reversible.** |

### Frame grouping semantics

One uploaded frame can produce multiple detection rows. `Delete frame` deletes
the whole **frame group**, resolved by this priority (task §2.2):

1. an existing frame/group id — *(the schema has none)*;
2. otherwise the exact non-null storage object path (`image_path`, or a path
   recovered from a legacy `image_url`);
3. otherwise only the selected detection event.

Other frames from the same session are never touched.

### API

```
GET    /api/admin/detections/{id}/frame   # preview (count, capture time, device, thumbnail)
DELETE /api/admin/detections/{id}/frame   # perform the hard delete
```

Admin-only (server-side role check). The service-role client is used only on the
server; it is never exposed to the browser. The operation:

1. verifies admin;
2. loads the selected event;
3. resolves the full frame group;
4. deletes the group's `traffic_sign_observations`;
5. deletes every detection event in the group;
6. for each affected `traffic_sign`: deletes it if it has **no remaining
   observations**, otherwise **recomputes** its aggregates
   (`recomputeSignAggregate`, using the same weighting/auto-verify rules as
   grouping);
7. deletes the storage object **only when no remaining DB record references that
   exact path** (via the existing `deleteOrphanFrameObjects` helper);
8. writes a safe audit log (`ADMIN_FRAME_DELETED`) with actor id, selected event
   id, deleted event/observation/sign counts, and whether the storage object was
   removed — **no signed URLs, tokens, or secrets**;
9. never deletes users, profiles, devices, sessions, or unrelated frames/logs.

### Storage-reference safety & partial failure

- The storage object is removed only after DB rows are gone and only if the exact
  path is unreferenced.
- The response is **structured**: `dbDeleted`, `deletedEvents`,
  `deletedObservations`, `deletedSigns`, `storageApplicable`, `storageDeleted`,
  `storageWarning`.
- If DB deletion succeeds but storage deletion fails, the response does **not**
  report full success: `storageDeleted = false` and a `storageWarning` is
  returned. The orphaned object remains discoverable by the existing
  **orphan-storage reconciliation** tool (`/admin/storage`).
- The endpoint is safe against repeated calls: once the frame is gone the event
  no longer exists → a clean `404`.

### UI

- **Detection Review** list: a red-outlined `Delete frame` button, visually
  separated (divider + spacing) from `Verify` to avoid accidental clicks.
- **Detection detail** page: an admin-only "Admin actions" card.
- Both open a confirmation **modal** (not a browser `confirm()`) showing the
  thumbnail, capture time, device, and number of detections that will be
  deleted, and the exact warning text. Admin-only visibility (and enforced
  server-side regardless of hidden UI).

---

## 3. Device active-status behavior

### Stopping detection keeps the phone active

Stopping a detection session now:

- sets the session `status = 'completed'` and `ended_at`;
- stops browser camera capture + location tracking;
- **does NOT** change the device's active/inactive status.

The field user can start another session immediately with the same active phone,
with no admin reactivation. (Previously, `Stop Detection` deactivated the
device.) The session-start and per-frame handlers likewise no longer flip device
status.

### Admin-only status control

Device active/inactive status is an **admin-only** field, enforced on the server:

- `PATCH /api/devices/{id}` rejects a `status` change from a non-admin with
  `403` (owners may still edit name/type).
- `DELETE /api/devices/{id}` (soft-deactivate) is admin-only (`403` otherwise).
- `PATCH /api/admin/devices/{id}` (Admin → Devices) retains full status control.

The field-user Devices UI hides status controls for non-admins to match the
server rules. Field users may still register/rename/select their devices and
start/stop sessions. A field user cannot activate/deactivate a device even via a
crafted request.

---

## 4. Admin-only security controls (summary)

- Permanent frame deletion is admin-only and checked on the server; hidden
  buttons are not relied upon.
- Device status changes are admin-only and checked on the server.
- The service-role key is never used client-side.
- Destructive API responses never return storage credentials or signed URLs.
- Audit logs never contain signed URLs, bearer tokens, or secrets.
- RLS protections and storage bucket privacy are unchanged; no public
  registration is introduced.

### Admin account provisioning

`scripts/provision-admin-user.mjs` creates/updates a Supabase Auth admin user
**idempotently**. Credentials are read from the environment at runtime and are
never hardcoded, committed, or printed:

```bash
ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_ROLE=admin node scripts/provision-admin-user.mjs
```

It auto-confirms the email, ensures the profile row exists with role `admin`, and
resets the password only through the secure admin API. Re-running updates the
existing user in place (no duplicate).

---

## Tests

- `tests/e2e/resolver.spec.ts` — resolver + humanization assertions (no creds).
- `tests/e2e/login-regression.spec.ts` — login form works; helper text removed.
- `tests/e2e/frame-deletion.spec.ts` — hard-delete semantics (creds + service key).
- `tests/e2e/device-status.spec.ts` — session stop leaves device active; status
  authz (creds + service key).
- `tests/e2e/unauth.spec.ts` — unauth guards for the new destructive endpoints.

Credential-gated specs skip cleanly when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`
and `SUPABASE_SERVICE_ROLE_KEY` are not set.

// Shared traffic-sign class display resolver.
//
// Converts a stored `detected_class_name` / `sign_type` (which may be a friendly
// name, a `Sign N` placeholder, or a raw canonical `category--...--gN` label)
// into a human-readable label, using the committed class map generated from
// classifier_index_classes_mapping.yaml.
//
// Safe to import in both client and server components (no runtime deps).
// Regenerate the map with `npm run gen:classes`.

import classMapJson from "@/data/traffic-sign-classes.json";

// Flat map of "<id>" -> "Friendly Name" (ids 0..399).
const CLASS_MAP = classMapJson as Record<string, string>;

const CATEGORY_TOKENS = new Set([
  "complementary",
  "information",
  "regulatory",
  "warning",
]);

const ACRONYMS = new Map<string, string>([
  ["led", "LED"],
  ["gps", "GPS"],
]);

const PHRASE_FIXES: Array<[RegExp, string]> = [
  [/\bU Turn\b/g, "U-Turn"],
  [/\bT Roads\b/g, "T-Roads"],
  [/\bY Roads\b/g, "Y-Roads"],
  [/\bX Roads\b/g, "X-Roads"],
];

function titleCaseWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  const acronym = ACRONYMS.get(lower);
  if (acronym) return acronym;
  if (/\d/.test(word)) return word; // preserve numeric tokens verbatim
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Kept in sync with scripts/generate-traffic-sign-class-map.mjs.
export function humanizeCanonicalLabel(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let tokens = trimmed.split("--").filter((t) => t.length > 0);
  if (tokens.length === 0) return null;

  if (tokens.length > 1 && CATEGORY_TOKENS.has(tokens[0]!.toLowerCase())) {
    tokens = tokens.slice(1);
  }
  if (tokens.length > 1 && /^g\d+$/i.test(tokens[tokens.length - 1]!)) {
    tokens = tokens.slice(0, -1);
  }
  if (tokens.length === 0) return null;

  const words = tokens.join("-").split("-").filter((w) => w.length > 0);
  if (words.length === 0) return null;

  let result = words.map(titleCaseWord).join(" ").replace(/\s+/g, " ").trim();
  for (const [re, repl] of PHRASE_FIXES) result = result.replace(re, repl);

  return result || null;
}

function normalizeId(classId: number | string | null | undefined): string | null {
  if (classId == null) return null;
  if (typeof classId === "number") {
    return Number.isInteger(classId) && classId >= 0 ? String(classId) : null;
  }
  const s = String(classId).trim();
  return /^\d+$/.test(s) ? s : null;
}

const SIGN_N_RE = /^sign\s+(\d+)$/i;

// A raw canonical label from the model, e.g. "regulatory--maximum-speed-limit-60--g1".
function isCanonicalLabel(s: string): boolean {
  return s.includes("--");
}

/**
 * Returns the friendly display name for a detection/sign.
 *
 * - Preserves an already-meaningful stored name (e.g. a manual review label).
 * - Resolves `Sign N` placeholders and raw canonical labels via the class map
 *   (by class id when available, otherwise by the N embedded in `Sign N`).
 * - Humanizes a raw canonical label that is not in the map.
 * - Falls back to `Sign {id}` / the raw stored value.
 */
export function getTrafficSignDisplayName(
  classId: number | string | null | undefined,
  storedClassName?: string | null,
): string {
  const stored = (storedClassName ?? "").trim();

  const storedIsPlaceholder = stored === "" || SIGN_N_RE.test(stored);
  const storedIsCanonical = stored !== "" && isCanonicalLabel(stored);

  // 1) A meaningful, already-friendly stored name wins (never overwrite a
  //    manually reviewed label).
  if (stored && !storedIsPlaceholder && !storedIsCanonical) {
    return stored;
  }

  // 2) Resolve by class id. When the numeric id was not passed alongside the
  //    row, recover it from a "Sign N" placeholder.
  let idKey = normalizeId(classId);
  if (idKey == null) {
    const m = stored.match(SIGN_N_RE);
    if (m) idKey = m[1]!;
  }
  if (idKey != null) {
    const mapped = CLASS_MAP[idKey];
    if (mapped) return mapped;
  }

  // 3) Stored was a raw canonical label not present in the map — humanize it.
  if (storedIsCanonical) {
    return humanizeCanonicalLabel(stored) ?? stored;
  }

  // 4) Last resort.
  if (idKey != null) return `Sign ${idKey}`;
  return stored || "Unknown sign";
}

// Number of classes in the committed map (for diagnostics / self-tests).
export function trafficSignClassCount(): number {
  return Object.keys(CLASS_MAP).length;
}

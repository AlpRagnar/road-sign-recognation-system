#!/usr/bin/env node
/**
 * Deterministic generator: classifier_index_classes_mapping.yaml -> committed JSON.
 *
 * Reads the model's canonical class list and produces TWO byte-identical JSON
 * artifacts consumed by both runtimes:
 *   - src/data/traffic-sign-classes.json  (Next.js app)
 *   - ai-server/classes.json              (FastAPI wrapper)
 *
 * Each artifact is a flat map { "<id>": "<Friendly Name>", ... } for ids 0..399.
 *
 * No YAML runtime dependency is added to the app: this build-time script parses
 * the very simple `names:\n  <id>: "<label>"` YAML shape itself.
 *
 * Humanization rules (kept in sync with src/lib/traffic-sign-classes.ts):
 *   1. split by "--"
 *   2. drop leading category token (complementary|information|regulatory|warning)
 *   3. drop trailing regional/graphic variant token matching ^g\d+$
 *   4. join remaining semantic tokens, replace hyphens with spaces
 *   5. readable title case, numbers preserved
 *   6. tidy common terms: u-turn -> U-Turn, led -> LED, *-roads -> *-Roads
 *   7. on failure, fall back to the raw canonical label
 *
 * Usage: node scripts/generate-traffic-sign-class-map.mjs [--check]
 *   --check : validate + verify existing artifacts are up to date (no write)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const YAML_PATH = join(ROOT, "classifier_index_classes_mapping.yaml");
const OUT_APP = join(ROOT, "src", "data", "traffic-sign-classes.json");
const OUT_AI = join(ROOT, "ai-server", "classes.json");

const EXPECTED_COUNT = 400; // ids 0..399 inclusive

const CATEGORY_TOKENS = new Set([
  "complementary",
  "information",
  "regulatory",
  "warning",
]);

// Word-level fixes applied after title-casing individual words.
const ACRONYMS = new Map([
  ["led", "LED"],
  ["gps", "GPS"],
]);

// Phrase-level fixes that re-introduce a hyphen for readability.
const PHRASE_FIXES = [
  [/\bU Turn\b/g, "U-Turn"],
  [/\bT Roads\b/g, "T-Roads"],
  [/\bY Roads\b/g, "Y-Roads"],
  [/\bX Roads\b/g, "X-Roads"],
];

function titleCaseWord(word) {
  if (!word) return word;
  const lower = word.toLowerCase();
  if (ACRONYMS.has(lower)) return ACRONYMS.get(lower);
  // Preserve tokens that contain digits verbatim (e.g. "60", "100", "g3-ish").
  if (/\d/.test(word)) return word;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Converts a raw canonical label into a friendly display label, or returns
 * null when the conversion cannot produce anything meaningful (caller falls
 * back to the raw label).
 */
export function humanizeCanonicalLabel(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let tokens = trimmed.split("--").filter((t) => t.length > 0);
  if (tokens.length === 0) return null;

  // Drop leading category token.
  if (tokens.length > 1 && CATEGORY_TOKENS.has(tokens[0].toLowerCase())) {
    tokens = tokens.slice(1);
  }
  // Drop trailing variant token (g1, g2, ...).
  if (tokens.length > 1 && /^g\d+$/i.test(tokens[tokens.length - 1])) {
    tokens = tokens.slice(0, -1);
  }
  if (tokens.length === 0) return null;

  const joined = tokens.join("-");
  const words = joined.split("-").filter((w) => w.length > 0);
  if (words.length === 0) return null;

  let result = words.map(titleCaseWord).join(" ").replace(/\s+/g, " ").trim();
  for (const [re, repl] of PHRASE_FIXES) result = result.replace(re, repl);

  return result || null;
}

// Minimal parser for the `names:\n  <id>: "<label>"` YAML shape.
function parseNamesYaml(text) {
  const lines = text.split(/\r?\n/);
  let inNames = false;
  const entries = new Map();
  for (const line of lines) {
    if (/^names\s*:\s*$/.test(line)) {
      inNames = true;
      continue;
    }
    if (!inNames) continue;
    // A non-indented, non-empty line ends the `names` block.
    if (line.trim() !== "" && !/^\s/.test(line)) break;
    const m = line.match(/^\s+(\d+)\s*:\s*"?(.*?)"?\s*$/);
    if (!m) continue;
    const id = Number(m[1]);
    const label = m[2];
    if (entries.has(id)) {
      throw new Error(`Duplicate class id ${id} in YAML.`);
    }
    entries.set(id, label);
  }
  return entries;
}

function build() {
  if (!existsSync(YAML_PATH)) {
    throw new Error(`Source YAML not found: classifier_index_classes_mapping.yaml`);
  }
  const text = readFileSync(YAML_PATH, "utf8");
  if (!/^names\s*:/m.test(text)) {
    throw new Error(`Root "names" key missing in YAML.`);
  }

  const entries = parseNamesYaml(text);

  // Validation.
  if (entries.size !== EXPECTED_COUNT) {
    throw new Error(
      `Expected exactly ${EXPECTED_COUNT} mappings, found ${entries.size}.`,
    );
  }
  for (let id = 0; id < EXPECTED_COUNT; id++) {
    if (!entries.has(id)) throw new Error(`Missing class id ${id}.`);
    const raw = entries.get(id);
    if (typeof raw !== "string" || raw.trim().length === 0) {
      throw new Error(`Empty/invalid label for class id ${id}.`);
    }
  }

  // Build the friendly map in numeric id order (stable output).
  const map = {};
  for (let id = 0; id < EXPECTED_COUNT; id++) {
    const raw = entries.get(id);
    const friendly = humanizeCanonicalLabel(raw) ?? raw;
    map[String(id)] = friendly;
  }
  return map;
}

function serialize(map) {
  // Stable, pretty JSON with a trailing newline.
  return JSON.stringify(map, null, 2) + "\n";
}

function writeArtifact(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function main() {
  const check = process.argv.includes("--check");
  const map = build();
  const content = serialize(map);

  if (check) {
    let ok = true;
    for (const [label, path] of [
      ["src/data/traffic-sign-classes.json", OUT_APP],
      ["ai-server/classes.json", OUT_AI],
    ]) {
      const current = existsSync(path) ? readFileSync(path, "utf8") : "";
      if (current !== content) {
        console.error(`[check] ${label} is out of date. Run the generator.`);
        ok = false;
      }
    }
    if (!ok) process.exit(1);
    console.log(`[check] OK — ${Object.keys(map).length} classes, artifacts current.`);
    return;
  }

  writeArtifact(OUT_APP, content);
  writeArtifact(OUT_AI, content);

  // Spot-check assertions from the task spec.
  const ASSERTIONS = {
    123: "Keep Right",
    138: "Maximum Speed Limit 30",
    150: "Maximum Speed Limit 60",
    164: "No Entry",
    318: "Other Danger",
    354: "Roadworks",
    392: "Wild Animals",
  };
  const failures = [];
  for (const [id, expected] of Object.entries(ASSERTIONS)) {
    if (map[id] !== expected) {
      failures.push(`  ${id} => "${map[id]}" (expected "${expected}")`);
    }
  }
  if (failures.length > 0) {
    console.error("Assertion mismatches:\n" + failures.join("\n"));
    process.exit(1);
  }

  console.log(`Generated ${Object.keys(map).length} classes -> both artifacts.`);
  for (const [id, expected] of Object.entries(ASSERTIONS)) {
    console.log(`  ${id} -> ${map[id]}  (== "${expected}")`);
  }
}

// Only run when executed directly (allows importing humanizeCanonicalLabel).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

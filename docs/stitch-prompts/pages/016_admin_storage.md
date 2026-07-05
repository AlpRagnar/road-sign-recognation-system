PAGE NAME: Admin Storage
ROUTE: /admin/storage
USER ROLE: Administrator
SCREEN TYPE: Storage governance console (backfill + reconciliation + quarantine)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px

PAGE PURPOSE
Govern captured-frame storage safely: view image-path backfill status, run quarantine-first reconciliation, and delete truly-orphaned objects only after safeguards. Safe operations must be clearly separated from destructive ones.

USER'S MAIN TASK
Check backfill status, run a (safe) reconciliation scan, review quarantine candidates, and only then delete eligible orphans.

VISUAL PRIORITY
A clear two-zone structure: "Reconciliation (safe, recommended)" vs "Destructive cleanup", with destructive actions in bordered danger zones and modal confirmations.

LAYOUT
App shell. Header, then two sections: "Quarantine reconciliation (recommended)" and "Backfill & legacy tools". Dense tables inside each.

PAGE HEADER
- Title "Admin · Storage", description "Backfill status, quarantine-first reconciliation, and safe orphan cleanup."

SECTION A — QUARANTINE RECONCILIATION (recommended, safe-first)
- A config line (grace period, scan caps, delete batch, prefix) + an amber safe-note: "Reconciliation only records unreferenced objects as pending quarantine candidates. It never deletes anything." + primary "Run reconciliation scan" (busy "Scanning…"). Result notice: "Reconciliation complete: scanned …, found …, added …. Nothing was deleted.".
- "Recent runs" table: Run · Mode · Status · Started · Completed · Scanned · Found · Added · Limited. Empty "No reconciliation runs recorded yet.".
- "Quarantine candidates": search "Search path…" + status filter ("All statuses" + Pending / Ignored / Restored / Deleted, default Pending) + checkbox "Eligible only". Table columns: (checkbox) · Object path (mono) · Size · Detected · Age · Status (BADGE) · Reason · Eligible · Actions. Row actions (pending only): "Ignore", "Restore" (non-pending show —). A DESTRUCTIVE "Delete selected ({n})" (busy "Deleting…") in a bordered danger area with a modal confirm: "This permanently deletes Storage objects. Only eligible, still-unreferenced pending candidates will be deleted.". Notice "Deleted {n}, skipped {n}.". Loading "Loading…"; empty "No quarantine candidates.".

SECTION B — BACKFILL & LEGACY TOOLS
- Card "Image path backfill status": stats Events total · Events w/ path · Events legacy-only · Signs total · Signs w/ path · Signs legacy-only. Loading "Loading…".
- Card "Backfill actions": "Dry run" (busy "Running…") + a DESTRUCTIVE-ish "Apply backfill" (busy "Applying…") with a modal confirm "Apply backfill? This updates image_path columns for matching rows.". Result may append "(capped — run again or use migration 0003 for bulk)".
- Card "Orphaned storage scan": "Scan orphans" (busy "Scanning…") + DESTRUCTIVE "Delete selected ({n})" (busy "Deleting…") with a modal confirm "Delete N orphan object(s)? This is permanent. Each path is re-checked as unreferenced before deletion.". Amber conservative-cleanup note; may append "Scan was limited — not all folders were inspected.".
- Card "Storage security notes": a bullet list (bucket private; signed URLs; refreshable; CSV/logs never store signed URLs; cleanup only under sessions/).

EXACT COMPONENTS: two governance sections, safe-note banners, reconciliation scan + run-history table, quarantine candidates table with Ignore/Restore + danger delete, backfill status stats + dry-run/apply, orphan scan + delete, security notes, modal confirmations.
EXACT FIELDS AND LABELS: all strings above verbatim (section headings "Quarantine reconciliation (recommended)", "Backfill & legacy tools", card titles, button labels, table columns, safe-notes, confirm sentences, notices, empty states).
PRIMARY ACTIONS: "Run reconciliation scan" (safe), "Scan orphans", "Dry run".
SECONDARY ACTIONS: search/filter/eligible-only; "Ignore"/"Restore".
DESTRUCTIVE ACTIONS: "Delete selected" (quarantine + orphans) and "Apply backfill" — each in a bordered danger zone with a modal confirmation stating the consequence + reference-safety copy.
FILTERS: quarantine path search + status + eligible-only.
TABLE OR CARD CONTENT: reconciliation runs + quarantine candidates + backfill stats.
MAP/DETAIL: none.
LOADING STATE: "Scanning…", "Applying…", "Deleting…", "Loading…" per control/table.
EMPTY STATE: "No reconciliation runs recorded yet.", "No quarantine candidates.".
ERROR STATE: inline red banner per action; partial results surfaced (deleted/skipped/rejected counts).
PERMISSION STATE: admin-only; non-admins redirected.
CONFIRMATION STATE: modal confirmations for every destructive action, quoting the exact consequence sentences.
MOBILE BEHAVIOR: low priority; sections stack; tables scroll horizontally inside their cards; destructive delete stays modal-confirmed. (No separate mobile file required.)
TABLET BEHAVIOR: two sections stack; tables scroll.
DESKTOP BEHAVIOR: safe reconciliation section first, then backfill/legacy; destructive zones clearly bordered.

REALISTIC EXAMPLE DATA
Backfill stats: "Events total 120 · Events w/ path 118 · Events legacy-only 2 · Signs total 35 · Signs w/ path 34 · Signs legacy-only 1". Reconciliation notice: "scanned 60, found 3, added 2. Nothing was deleted." Quarantine row: "sessions/…/1690-ab12.jpg · 46 KB · 6/20/2026 · 5d · Pending · unreferenced · Eligible". Object paths shown as storage keys only — never signed URLs.

CONSISTENCY RULES
Safe vs destructive zones are visually distinct; every destructive action is modal-confirmed with reference-safety copy; quarantine status uses badges (Pending/Ignored/Restored/Deleted); paths in mono; NEVER show signed URLs or secrets.

ELEMENTS TO AVOID
Destructive delete sitting next to safe scan with the same styling; browser confirm()-style ambiguity (use modals); exposing signed URLs; giant empty cards.

FINAL STITCH INSTRUCTION
Design a storage governance console with a safe "Quarantine reconciliation (recommended)" section (scan + run-history table + candidates table with Ignore/Restore and a bordered danger "Delete selected" modal) and a "Backfill & legacy tools" section (backfill status stats, Dry run / Apply backfill, orphan scan + delete), where every destructive action lives in a bordered danger zone with a consequence-and-reference-safety modal — using the exact palette and status language below. Never display signed URLs.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.

# Implementation Plan

Visual redesign of the existing Traffic Sign Mapping app to the approved Stitch export. Bind every redesigned component to existing real data/handlers/auth. No schema/RLS/API/migration changes. No commit/push/deploy.

## Order

### Phase 2 — Shared design system (do first; touches everything)
1. **Fonts** — `next/font/google` Inter + JetBrains Mono in `src/app/layout.tsx` (self-hosted at build; no runtime remote fonts). CSS variables `--font-inter`, `--font-mono`.
2. **Tokens** — extend `tailwind.config.ts`: `primary #1D4ED8`, `navy #0F172A`, `teal #0D9488`, `amber #F59E0B`, `canvas #F5F7FA`, `line #E2E8F0`, `panel #F1F5F9`; fonts `sans`/`mono`; radius 8/6. Keep existing `brand` alias for back-compat.
3. **Icon component** — `src/components/ui/Icon.tsx`: small inline-SVG set (nav + common UI). No icon-font dependency.
4. **Shared UI primitives** — `src/components/ui/`: `StatusBadge` (6 review + device/service states, dot+Title-Case), `KpiTile`, `PageHeader` (restyle in place), `ConfirmModal` (focus-trap, ESC, no backdrop-dismiss for destructive), `OverflowMenu`, `DangerZone`, `EmptyState`, `ErrorBanner`, button class helpers (`btnPrimary/btnSecondary/btnDanger`), table class helpers.
5. **App shell** — rewrite `AppSidebar` to the navy design (brand + "Road-Sign Inventory Platform", GENERAL/ADMIN groups with real routes + nav icons, active = solid blue, account block role badge + Sign out, mobile hamburger + drawer, focus/aria). Real `signOut`, real role gating (field users see no Admin group). Update `(protected)/layout.tsx` background to `canvas`.

### Phase 3 — Routes
- **Batch A:** `/login` (split brand+card, real auth), `/` (public landing for unauth; keep auth redirect).
- **Batch B:** `/dashboard` (real KPIs → KpiTile; verification bars; top types; recent detections table; inventory mini-map link to `/map/signs`), `/detection` (restyle to camera hero + control rail; keep all real logic), `/map/signs` + `/map/devices` (restyle toolbars/panels; keep live Leaflet), `/devices` (table + StatusBadge; cards mobile), `/presentation` (numbered steps).
- **Batch C:** `/admin/logs`, `/admin/detections`, `/detections/[id]`, `/admin/review` (StatusBadge everywhere; overflow actions; separated destructive; evidence-first detail).
- **Batch D:** `/admin/devices`, `/admin/users`, `/admin/ai`, `/admin/analytics`, `/admin/storage`, `/admin/demo` (restyle headers + tables + badges + danger zones; real fields only).

### Phase 4 — Responsive
Mobile drawer (in shell); table→card patterns already present or added; sign-map/device-map keep map-first; detection session mobile controls; safe-area utilities in globals; 44px targets; keep `viewport` zoomable (no `user-scalable=no`).

### Phase 5 — Validation
`npm run lint`, `npm run typecheck`, `npm run build`; targeted Playwright specs; visual smoke via dev/prod server at 1440 + 390 (+375 detection). Update any test selectors broken by the redesign WITHOUT weakening assertions.

## Files to add
`src/components/ui/{Icon,StatusBadge,KpiTile,ConfirmModal,OverflowMenu,DangerZone,EmptyState,ErrorBanner,buttons,PublicHeader}.tsx`; `src/app/(public landing)` content in `src/app/page.tsx` + a `LandingPage` client/section components; `public/ui-previews/*` (localized landing images); `public/brand/logo.svg`.

## Files to change
`tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/AppSidebar.tsx`, `src/components/PageHeader.tsx`, `src/app/(protected)/layout.tsx`, `src/app/login/page.tsx`, `src/app/page.tsx`, `src/app/(protected)/dashboard/page.tsx`, and each route's page/client for restyle + StatusBadge adoption.

## Asset plan
Copy the two `a_realistic_*` UI showcase PNGs + `technical_precision_engineering` + 1–2 road-scene photos into `public/ui-previews/` (landing only). Logo → `public/brand/logo.svg` (recreate as clean inline SVG). No hotlinking. No signed URLs/secrets in source.

## Test plan
Run existing Playwright suite (unauth, resolver, live-results, login-regression + gated authed/frame/device specs). Fix selectors that referenced old markup (e.g., sidebar text, headings) while keeping behavioral assertions. Add no fake data.

## Risks
- Sidebar rewrite touches every authed page → validate nav + role gating + active state carefully.
- `/` behavior change (landing for unauth) → ensure authenticated redirect intact and middleware still allows `/` public.
- Icon set scope → keep minimal inline SVGs; avoid remote icon font.
- Test selectors (e.g., login "Sign in" heading, sidebar labels) may need updates.
- Font swap via next/font must not break build (network at build time) — fallback to CSS `font-family` stack if unavailable.

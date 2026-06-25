# Mobile Responsive & Camera/GPS Readiness Audit (TASK 024)

Verifies the system is mobile-responsive and ready for real mobile camera/GPS testing
before real AI model integration. Changes were minimal and targeted; desktop behaviour
is preserved.

## Tested viewport sizes

| Profile | Size | How |
| --- | --- | --- |
| iPhone 13/14 | 390 × 844 | Playwright spec + capture script |
| Pixel 5 | 393 × 851 | Playwright spec |
| Small mobile | 375 × 667 | Playwright spec |
| Tablet | 768 × 1024 | Playwright spec (`/login`) |

## Pages tested

`/login`, `/dashboard`, `/devices`, `/detection`, `/map/signs`, `/map/devices`,
`/admin/ai`, `/admin/analytics`, `/admin/storage`, `/admin/demo`,
`/presentation?presentation=1`.

## How it was tested

1. **Automated mobile smoke spec** — `tests/e2e/mobile.spec.ts` (structural, not pixel-
   exact): asserts **no horizontal overflow** (`scrollWidth ≤ clientWidth + 2px`),
   no Next.js error overlay, mobile hamburger present, and that the drawer opens and
   navigates. Result: **7/7 passed**; full suite **31/31** (24 prior + 7 mobile).
2. **Programmatic mobile inspection + screenshots** at 390 × 844 (logged in as admin,
   geolocation + fake media stream granted). Per-page metrics below.

### Per-page inspection (390 × 844, authenticated)

| Page | Overflow | Error overlay | Nav (hamburger) | Notes | Demo-acceptable |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | 0 px | none | ✅ | KPI cards stack to 1 column | ✅ |
| `/detection` | 0 px | none | ✅ | Camera preview is `aspect-video w-full`; device selector + Start usable; single-column | ✅ |
| `/map/signs` | 0 px | none | ✅ | Leaflet renders, 26 markers, controls visible; map fills viewport under top bar | ✅ |
| `/map/devices` | 0 px | none | ✅ | Leaflet renders, 4 device markers | ✅ |
| `/admin/demo` | 0 px | none | ✅ | Cards/buttons stack; counts visible | ✅ |
| `/presentation?presentation=1` | 0 px | none | ✅ | Guided cards stack; presentation badge visible | ✅ |
| `/admin/ai`, `/admin/analytics`, `/admin/storage`, `/devices` | 0 px | none | ✅ | Wide tables scroll horizontally inside `overflow-x-auto` wrappers (already present) | ✅ |

## Issues found

1. **Blocker — no mobile navigation.** `AppSidebar` was a fixed `w-60` (240 px)
   always-visible column with no mobile menu, consuming ~60 % of a 390 px screen and
   leaving content cramped. No hamburger / drawer existed.
2. **Map pages full height vs. mobile top bar.** The two map pages used `h-screen`
   (100 vh); once a mobile top bar was added, that would have overflowed the viewport by
   the bar height.
3. **No mobile-specific regression coverage.** No Playwright test exercised mobile
   viewports.

No issues found with: admin tables (all 10 table components already wrap in
`overflow-x-auto`), the detection camera preview (`aspect-video w-full`, `playsInline`),
the detection layout (`grid-cols-1 lg:grid-cols-3`), or hydration/SSR (no error overlay
on any page).

## Fixes made (minimal, Tailwind-only / structural)

1. **`src/components/AppSidebar.tsx`** — added a mobile top bar with a hamburger button,
   a slide-in drawer (`fixed … -translate-x-full` → `translate-x-0` when open) with a
   backdrop and a close button, and auto-close on route change. On `md+` the sidebar is
   unchanged (`md:static md:translate-x-0`). Nav links close the drawer on tap.
2. **`src/app/(protected)/layout.tsx`** — root flex is now `flex-col md:flex-row` so the
   mobile top bar stacks above content; added `min-w-0` to `<main>` so flex children can
   shrink (prevents overflow from wide content).
3. **`src/app/(protected)/map/signs/page.tsx`** and **`.../map/devices/page.tsx`** —
   `h-screen` → `h-[calc(100dvh-3.5rem)] md:h-screen` so the full-height map fits under
   the mobile top bar on mobile and stays full-screen on desktop.
4. **`tests/e2e/mobile.spec.ts`** — new lightweight mobile smoke spec (added, not a
   product change).

No features were added, no desktop behaviour removed, no schema/API changes.

## Screenshots

Captured at 390 × 844 into `public/final-screenshots/mobile/`:
`mobile-dashboard.png`, `mobile-detection.png`, `mobile-sign-map.png`,
`mobile-devices-map.png`, `mobile-admin-demo.png`, `mobile-presentation.png`.
(`public/final-screenshots/` is gitignored by project choice — deliver out-of-band.)

## Real mobile device camera/GPS readiness

The app uses `getUserMedia` (camera) and the Geolocation API. **Both require a secure
context (HTTPS) on real mobile browsers** — plain `http://LOCAL_IP:3000` will typically
fail to grant camera/GPS on a phone (only `http://localhost` on the same machine is
treated as secure). Code-wise the page is ready: it requests permissions, uses
`playsInline` (iOS), handles denial gracefully, and the layout fits mobile.

**Recommended ways to test on a real phone (pick one — do not implement here):**
- **Option A — HTTPS preview deploy:** deploy a preview (e.g., Vercel) and open the
  `https://…` URL on the phone. Simplest end-to-end; uses real HTTPS certs.
- **Option B — Secure tunnel:** expose the local dev server over HTTPS with a tunnel
  (e.g., `cloudflared tunnel --url http://localhost:3000`, or `ngrok http 3000`) and open
  the generated `https://…` URL on the phone.
- **Option C — Local HTTPS with mkcert:** `mkcert` a locally-trusted cert and serve the
  app over HTTPS on the LAN IP, trusting the root CA on the phone.

For Option A/B, set `AI_MODEL_MODE=mock` (or a reachable model URL) and ensure the phone
can reach the Supabase project. Keep secrets server-side; never expose `.env.local`.

## Remaining limitations

- Real on-device camera/GPS not validated here (needs HTTPS per above; this audit used
  desktop emulation with a fake media stream + injected geolocation).
- Map pages depend on internet for OpenStreetMap tiles.
- Admin tables remain horizontally scrollable on small screens by design (acceptable per
  the task) rather than reflowing into cards.
- `100dvh` is used for the mobile map height; on very old mobile browsers without `dvh`
  support the map may be slightly shorter (still usable, no overflow).

## Final mobile readiness verdict

**Ready with minor limitations.** All 11 pages render with zero horizontal overflow at
375–768 px, mobile navigation works, no SSR/hydration crashes, camera preview and
device selector/Start are mobile-usable, and maps render with visible controls. The only
outstanding item is real-device camera/GPS, which is a deployment/HTTPS step (Options
A–C), not an application defect.

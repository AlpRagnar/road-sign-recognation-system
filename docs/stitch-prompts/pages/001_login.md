PAGE NAME: Login / Sign In
ROUTE: /login
USER ROLE: Public (field user or administrator authenticating)
SCREEN TYPE: Authentication page (single screen, centered form)
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 768px, 390px (mobile behavior described below — no separate file)

PAGE PURPOSE
Let an existing user sign in with email + password. There is NO public self-registration (accounts are provisioned by administrators). Keep authentication logic and messaging exactly as in the app.

USER'S MAIN TASK
Enter email + password and sign in; see a clear error if credentials are wrong.

VISUAL PRIORITY
The sign-in card. On desktop, pair it with a left brand/credibility panel so the page communicates the domain (road-asset operations) without distracting from the form.

LAYOUT
Two-column split on desktop: left = brand/credibility panel (~55%), right = centered sign-in card (~45%) on the app background. On mobile: single centered card only.

PAGE HEADER
No app sidebar (public). Small logo + "Traffic Sign Mapping" at the top of the card.

MAIN CONTENT AREAS
- LEFT PANEL (desktop only): deep slate-navy panel with the logo + wordmark, a one-line positioning statement ("Road-sign inventory and AI operations"), a muted static map texture (blue markers over a subtle OSM-style basemap, low contrast so it never competes with the form), and three small trust lines with line icons: "Private image storage", "Role-based access", "Audit-ready records". No marketing fluff.
- RIGHT CARD: title "Traffic Sign Mapping", subtitle "Sign in to continue"; Email field (type email, placeholder "you@example.com"); Password field (type password, placeholder "••••••••"); primary full-width button "Sign in" (busy label "Signing in…"); an inline error banner appears above/below the button when auth fails (red banner using the Supabase error message text). No "create account" link, no social login.

EXACT COMPONENTS: split layout, brand panel, sign-in card, two labelled inputs, primary button, inline error banner.
EXACT FIELDS AND LABELS: heading "Traffic Sign Mapping"; subtitle "Sign in to continue"; "Email" (placeholder "you@example.com"); "Password" (placeholder "••••••••"); button "Sign in" / "Signing in…".
PRIMARY ACTIONS: "Sign in".
SECONDARY ACTIONS: none. (No "Forgot password" unless it exists — it does not; do not add self-registration.)
DESTRUCTIVE ACTIONS: none. FILTERS: none. TABLE/CARD/MAP/DETAIL: n/a.
LOADING STATE: button shows "Signing in…" and is disabled while authenticating.
EMPTY STATE: n/a.
ERROR STATE: red inline banner with the auth error message (e.g., "Invalid login credentials"); the form stays on /login; fields keep their values.
PERMISSION STATE: n/a (public). Already-authenticated users are redirected to /dashboard by the app.
CONFIRMATION STATE: n/a.
MOBILE BEHAVIOR (390/375px): hide the left brand panel; show only the centered card at ~92% width with 16px padding; inputs and button are full-width, ≥44px tall; the small logo + wordmark sit above the card title; the error banner spans the card width. No horizontal scroll.
TABLET BEHAVIOR (768px): left brand panel may collapse to a slim top brand strip; card centered.
DESKTOP BEHAVIOR: split layout as described; card max-width ~380px; vertically centered.

REALISTIC EXAMPLE DATA
Email "surveyor@aalborg.example", password masked; error example "Invalid login credentials". Left-panel trust lines exactly: "Private image storage", "Role-based access", "Audit-ready records".

CONSISTENCY RULES
Same logo lockup and palette as the app. The brand panel navy matches the sidebar navy (#0F172A). Button = primary blue. Error banner = danger red on #FEF2F2.

ELEMENTS TO AVOID
Giant hero, social-login buttons, "Create account"/self-registration, decorative gradients, glassmorphism, stock office photos, oversized illustration. Keep the form the clear focus.

FINAL STITCH INSTRUCTION
Design a professional two-column sign-in page for a road-asset operations platform: a muted navy brand/credibility panel with a subtle map texture on the left and a compact, centered email/password sign-in card on the right, using the exact palette and typography below. Mobile collapses to the card only. No self-registration.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.

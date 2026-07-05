PAGE NAME: Admin Users
ROUTE: /admin/users
USER ROLE: Administrator
SCREEN TYPE: Paginated user table + create-user panel + credential dialog
PRIMARY VIEWPORT: 1440px desktop
SECONDARY VIEWPORTS: 1280px, 1024px, 768px, 390px

PAGE PURPOSE
View all profiles, edit a user's display name and role, create a Supabase Auth user, and reset a user's password (shown once). Role changes are sensitive and must be deliberate.

USER'S MAIN TASK
Find a user; adjust name/role; create a user or reset a password when needed.

VISUAL PRIORITY
A clean user table with a ROLE BADGE and a deliberate role-change control; a focused create-user panel.

LAYOUT
App shell. Header, a filter row with a "Create user" toggle, then a paginated table.

PAGE HEADER
- Title "Admin · Users", description "All profiles. Update display name and role. Auth-level user creation is out of scope." (Note: creation via the Admin API IS available through the create form — keep the description as-is unless the team updates it.)

FILTERS / ACTIONS (one row)
- Search input "Search email or name…".
- Role filter select ("All roles" / user / admin).
- Toggle button "Create user" (flips to "Cancel" when the form is open).

CREATE-USER PANEL (side panel or inline card "Create a Supabase Auth user")
- Fields: "Full name", "Email *", "Role *" (user / admin), checkbox "Auto-generate temporary password"; when unchecked, a password input "Min 8 characters". Submit "Create user" (busy "Creating…").

TABLE COLUMNS (in order)
Full name (inline-editable, placeholder "—") · Email · Role (a ROLE BADGE that opens a small "Change role" menu user/admin; disabled for the current user with tooltip "You cannot change your own role") · Created (date) · Actions ("Reset password", busy "Resetting…").

CREDENTIAL DIALOG (one-time, on create or reset)
- On create: title "User created" with rows Email, Full name, Role + the generated password shown once (with a copy affordance and a "shown only once" note).
- On reset: title "Password reset" with row Email + the new password shown once.

EXACT COMPONENTS: filters (search + role) + "Create user" toggle, create-user form, user table with role badge+menu, reset-password action, one-time credential dialog, pagination.
EXACT FIELDS AND LABELS: "Admin · Users", the description, "Search email or name…", "All roles", "Create user"/"Cancel", "Create a Supabase Auth user", "Full name", "Email *", "Role *", "Auto-generate temporary password", "Min 8 characters", "Create user"/"Creating…", columns Full name, Email, Role, Created, Actions, "Reset password"/"Resetting…", "You cannot change your own role", dialog titles "User created" / "Password reset", empty "No users match your filters.".
PRIMARY ACTIONS: "Create user"; inline edit name; change role (deliberate).
SECONDARY ACTIONS: "Reset password"; filters; pagination.
DESTRUCTIVE ACTIONS: none irreversible; "Reset password" is confirmed ("Reset password for {email}?" / self: "Reset YOUR OWN password? You will need the new password to log in next time.").
FILTERS: search + role.
TABLE OR CARD CONTENT: the profile rows.
LOADING STATE: "Loading users…" skeleton rows.
EMPTY STATE: "No users match your filters." + Clear filters.
ERROR STATE: inline red banner; per-action failure → toast.
PERMISSION STATE: admin-only; the current user's role control is disabled with the tooltip.
CONFIRMATION STATE: reset-password confirmations; the one-time credential dialog after create/reset.
MOBILE BEHAVIOR (390px): table → user cards (Full name + Role badge on line 1; Email + Created on line 2; a "⋯" menu with Reset password + Change role); create-user as a bottom sheet; the credential dialog is a centered modal with a copy button.
TABLET BEHAVIOR (768px): table fits or scrolls; create-user as a side panel.
DESKTOP BEHAVIOR: full table + role badge/menu + create-user panel.

REALISTIC EXAMPLE DATA
Rows: "Demo Admin · admin@example.com · admin · 6/18/2026"; "Field Surveyor · surveyor@aalborg.example · user · 6/20/2026". Create example: "New Field User · fielduser@aalborg.example · user". Never display real passwords in examples — show a masked placeholder "••••••••" for the one-time value.

CONSISTENCY RULES
Role as a badge with a deliberate change menu; self-role disabled with the tooltip; the one-time credential dialog clearly states it's shown once; no password is ever persisted or re-shown.

ELEMENTS TO AVOID
An inline role dropdown that's easy to trigger accidentally; showing passwords in plain lists; a self-role control that looks editable.

FINAL STITCH INSTRUCTION
Design an Admin Users page: filters (search + role) with a "Create user" toggle opening a create-user form (Full name, Email, Role, auto-generate-password checkbox), a user table with inline name edit and a Role BADGE that opens a deliberate "Change role" menu (self-role disabled), a "Reset password" action, and a one-time credential dialog with a copy button — using the exact palette and status language below.

— GLOBAL CONSISTENCY (include in every screen) —
Product: serious geospatial road-sign inventory & AI-operations platform for municipalities, road authorities, and infrastructure/research teams — engineering operations software, not a generic SaaS/fintech/CRM/crypto dashboard. Shell: 240px deep slate-navy sidebar (#0F172A), light-slate items, active item blue (#1D4ED8) fill white; brand "Traffic Sign Mapping" with a map-pin-with-sign logo (no "MVP"); user email + role chip + Sign out bottom; hamburger drawer under 768px. Background #F5F7FA; white cards, 1px #E2E8F0 borders (borders over shadows); primary blue #1D4ED8; geo teal #0D9488; destructive red #DC2626; text #0F172A; muted #64748B; selected row #EFF6FF; selected marker amber #F59E0B; focus ring #2563EB. Status badges (pill, dot + Title-Case, never raw snake_case): Pending amber, Auto verified sky, Manually verified green, Rejected red, Duplicate violet, Low confidence orange; Active green, Inactive grey, Offline red; Healthy green, Degraded amber, Unavailable red. Type: Inter; mono for coordinates/IDs/ms/timers/bbox. Page title 20–22px/600; section 15–16/600; body 14; table 13 tabular; KPI 22–26 (compact, not giant). Compact 4px spacing; page padding 24 (16/12 mobile); card padding 16; table rows 40; sticky headers; radius 8 (6 badges, 10 modals); 2px line icons. Dense tables = one primary action + "⋯" overflow + separated destructive; styled selects + date-range (not raw browser date inputs); segmented controls; underline tabs; right slide-in panels; modal confirmations spelling out destructive consequences; toasts; skeletons; clear empty/error states. Maps get priority: blue pins, blue count clusters, amber selected, density legend, filter toolbar + counter. Responsive: ≥768 sidebar + dense tables; <768 sidebar drawer, tables→cards, panels→bottom sheets, filters→drawer, primary actions→sticky bottom bar with safe-area padding. Accessibility: WCAG AA; ≥44px targets; visible focus; status by label+shape not colour alone; labelled inputs/icon buttons; focus-trapped modals. Avoid: glassmorphism, neon, gradients, giant hero cards, huge empty space, stock 3D/illustration, fake logos, invented stats, rainbow charts.

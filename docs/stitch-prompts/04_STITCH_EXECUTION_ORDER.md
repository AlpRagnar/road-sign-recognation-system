# 04 — Stitch Execution Order

How to generate the pages in Google Stitch so the whole product stays visually consistent. Generate ONE prompt at a time. Every prompt in `pages/` already contains the global consistency block, so each is independently pasteable — but generating in this order lets you carry a visual reference forward and reject drift early.

## Recommended order

| Step | Prompt file to paste | Validate visually | Use as reference for | Must stay consistent |
|------|----------------------|-------------------|----------------------|----------------------|
| 1 | `pages/000_landing_page.md` | Overall visual direction: infrastructure blue, navy accents, real map/dashboard previews, NO generic SaaS hero | Establishes brand colour, type, logo lockup for everything | Palette, logo, type scale |
| 2 | `pages/002_dashboard.md` | The authenticated APP SHELL (240px navy sidebar, sticky white header, active blue nav) + compact KPI tiles + semantic bars | The shell for every authenticated page | Sidebar, header, KPI tile size, status-bar colours |
| 3 | `pages/009_detection_review.md` | The DENSE TABLE + action pattern (primary Verify + "⋯" overflow + separated red Delete frame) + status badges + delete-frame modal | Every table page (logs, admin devices, users, analytics table) | Table density, row height, status badges, action pattern, destructive separation |
| 4 | `pages/004_sign_map.md` | The MAP language (blue pins, blue clusters, amber selected, density legend, filter toolbar, right detail panel) | Device Map + all map screens | Marker/cluster/selected colours, legend, filter toolbar |
| 5 | `pages/003_mobile_detection_session_375px.md` | The FIELD MOBILE pattern (camera hero, sticky bottom action bar, GPS/status chips) | All mobile variants (sticky bottom bar, safe area) | Mobile sticky actions, camera framing, status chips |
| 6 | `pages/010_detection_detail.md` | The DETAIL template (image+bbox hero, fact sheet, collapsible raw JSON, separated admin danger zone) | Sign detail panel, any record detail | Evidence-first hierarchy, badge, danger zone |
| 7 | `pages/014_ai_integration.md` | The OPS-CONSOLE pattern (persistent health chip, tabs, stat cards, time-series, filtered log table) | Analytics + any monitoring view | Health colour language, tabs, stat cards |
| 8 | `pages/015_analytics.md` | Charts tied to the semantic palette (blue/green/red/teal) + dense snapshot table + warning banner | Any future charts | Chart colours = meaning, warning banner |
| 9 | Remaining admin pages: `008_detection_logs`, `011_sign_review`, `012_admin_devices`, `013_admin_users`, `016_admin_storage`, `017_demo_tools`, `007_presentation` | Each reuses shell + table/badge/danger patterns from steps 2–3 | — | Reuse steps 2–3 patterns exactly |
| 10 | General pages: `001_login`, `006_devices` | Login split layout; Devices table + register panel + admin-only status | — | Brand panel navy = sidebar navy; admin-only gating |
| 11 | Shared states: loading skeletons, empty states, error banners, 403/permission, the delete-frame + credential + clear-demo modals | Verify these match across pages | — | One skeleton/empty/error/modal language |
| 12 | Mobile variants: `000_landing_page_mobile`, `004_sign_map_mobile_390px`, `005_device_map_mobile_390px`, `006_devices_mobile`, `009_detection_review_mobile`, `010_detection_detail_mobile` | Verify these are true mobile structures (bottom sheets, drawers, card lists), NOT scaled desktop | — | Bottom sheets, filter drawers, sticky bottom bar, card lists |

## After each generation — keep this consistent
- Sidebar: 240px navy, active item blue, brand lockup (never "MVP").
- Status: the exact 6 review badges + device/service states, Title-Case, dot+label.
- Tables: 40px rows, 13px cells, sticky header, one primary action + "⋯" overflow + separated destructive.
- Maps: blue pins / blue clusters / amber selected / density legend.
- Compact spacing; no oversized cards; no giant empty hero.

## Reject a Stitch output if any of these are true
- It looks like a generic SaaS / fintech / CRM / crypto / startup dashboard.
- Too much empty space; oversized cards; giant headings.
- The map is secondary when it should be primary (Sign Map, Device Map, landing).
- Important actions are hidden, or five equal-weight buttons compete in a table row.
- The destructive action (Delete frame, Delete orphans, Clear demo) is NOT separated or NOT modal-confirmed with a consequence sentence.
- Mobile layout is just a scaled desktop page (no bottom sheets/drawers/sticky bottom bar; tables not converted to cards).
- Colours are inconsistent with the palette; status meanings are unclear or raw `snake_case`.
- Table density is too low (airy rows) for an operations tool.
- Field-session controls are not outdoor-friendly (Start/Stop not thumb-reachable/sticky; tiny GPS text).
- Glassmorphism, neon, decorative gradients, stock 3D/illustrations, fake logos, or invented statistics appear.
- The brand still says "MVP dashboard".

If rejected: re-paste the SAME page prompt, add one line naming the specific violation (e.g., "The Delete frame button must be separated from Verify and open a confirmation modal"), and regenerate.

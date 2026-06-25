# Report Export Guide (DOCX / PDF)

How to turn `PROJECT_REPORT_FINAL.md` into a submission-ready DOCX and PDF. Two options:
Pandoc (automated) and manual Word/Google Docs.

## Option A — Pandoc (recommended)

Install Pandoc (https://pandoc.org/installing.html). For PDF, also install a LaTeX engine
(e.g. TeX Live, MiKTeX, or `tinytex`) — DOCX export does **not** need LaTeX.

```bash
cd docs/final-submission

# DOCX (no LaTeX required)
pandoc PROJECT_REPORT_FINAL.md -o PROJECT_REPORT_FINAL.docx

# PDF (requires a LaTeX engine; pick one installed on your system)
pandoc PROJECT_REPORT_FINAL.md -o PROJECT_REPORT_FINAL.pdf --pdf-engine=xelatex
```

Optional polish:

```bash
# Numbered sections + table of contents + 1-inch margins
pandoc PROJECT_REPORT_FINAL.md -o PROJECT_REPORT_FINAL.docx \
  --toc --number-sections

pandoc PROJECT_REPORT_FINAL.md -o PROJECT_REPORT_FINAL.pdf \
  --toc --number-sections --pdf-engine=xelatex \
  -V geometry:margin=1in -V fontsize=11pt
```

Notes:
- If `--pdf-engine=xelatex` is unavailable, try `--pdf-engine=pdflatex` or install
  `tinytex` (`quarto install tinytex` or the R `tinytex` package).
- The ASCII data-flow diagram in §6 is inside a fenced code block and will render in a
  monospace font — acceptable, or replace it with an exported image before converting.
- To merge the references, either append `REFERENCES_FINAL.md` to the report before
  conversion or convert it separately and place it as the final section.

```bash
# Single combined document (report + references)
pandoc PROJECT_REPORT_FINAL.md REFERENCES_FINAL.md \
  -o PROJECT_REPORT_FINAL_WITH_REFS.docx --toc --number-sections
```

## Option B — Manual Word / Google Docs

1. Open `PROJECT_REPORT_FINAL.md` in a Markdown-aware editor (VS Code preview, Typora,
   or https://dillinger.io) and copy the rendered content.
2. Paste into **Microsoft Word** or **Google Docs**. Alternatively, in Google Docs use a
   Markdown import add-on, or in Word use *Insert → Object → Text from File* on the `.md`.
3. Apply heading styles (Heading 1/2), fix the monospace code block (§6) if desired,
   insert screenshots (see below), then **File → Download/Export → PDF**.
4. Append the references from `REFERENCES_FINAL.md` and renumber if your style differs.

## Screenshots to capture and insert before final export

Seed demo data first (`/admin/demo` → Seed) so pages are populated, then capture:

- [ ] **Dashboard** (`/dashboard`) — KPI cards + verification breakdown.
- [ ] **Traffic sign map** (`/map/signs`) — clustered/density markers.
- [ ] **Sign detail panel** — opened from a marker on `/map/signs`.
- [ ] **Detection detail with bounding box** (`/detections/[id]`).
- [ ] **Admin AI observability** (`/admin/ai`) — health/self-test + charts.
- [ ] **Admin analytics** (`/admin/analytics`) — snapshot KPIs + trend bars.
- [ ] **Demo / presentation page** (`/presentation?presentation=1`).

Place these in a "Figures" section or inline near the relevant report sections (§13–§17).

## Safety reminders
- Do **not** include `.env.local`, service-role keys, API keys, the `CRON_SECRET`, or
  real passwords in screenshots or exported files. Crop/redact the address bar and any
  token-bearing UI before inserting images.
- Use a non-production Supabase project for demo screenshots.

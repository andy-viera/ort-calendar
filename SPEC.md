# ORT Calendar — Semester Events Tool

## Spec v1.0 — 2026-03-16

---

## 1. What Is This

A free, open-source web tool for Universidad ORT Uruguay engineering students that automatically gives them all their semester evaluation dates (parciales, entregas, obligatorios, 2das instancias) in a format they can import into Google Calendar, Apple Calendar, or Outlook with one click.

**Tagline:** "Todos tus parciales y entregas en tu calendario, en un click."

---

## 2. Why This Exists

Every semester, ORT engineering students need to manually find and track 15-30+ evaluation dates scattered across:
- **Bedelía PDFs** — formal event calendars (parciales, entregas, obligatorios) published once per semester
- **Aulas course pages** — informal dates posted by professors in various formats

Most students either track these manually or just forget dates until it's too late. This tool eliminates that problem entirely.

---

## 3. User Experience (The Happy Path)

1. Student visits `ortcal.aviera.me`
2. Selects their **carrera** (Ing. en Sistemas, Ing. Eléctrica, Ing. en Biotecnología, Ing. en Electrónica)
3. Sees **all subjects across all semesters**, grouped by semester number (e.g. "Semestre 1", "Semestre 2", ...). This is important because students may be retaking subjects from earlier semesters while taking current ones.
4. Checks the specific subjects they're currently enrolled in
5. Sees a calendar preview with only their selected events
6. Clicks **"Agregar a Google Calendar"** → Google Calendar opens asking "Add this calendar?" → Yes → **done, all events synced and auto-updating**
7. Or clicks **"Descargar .ics"** for Apple Calendar / Outlook / manual import

**That's it. One click + one confirmation for Google Calendar users. No OAuth, no API keys, no accounts.**

---

## 4. Data Sources

### 4.1 University Platforms

- **Aulas (Moodle):** https://aulas.ort.edu.uy — main academic platform. Each subject has a course page where professors post info.
- **Bedelía - Escuela de Ingeniería:** https://aulas.ort.edu.uy/course/view.php?id=1616 — central page with links to PDF event calendars for all engineering careers/semesters.
- **Example PDF (Semester 6):** https://aulas.ort.edu.uy/pluginfile.php/962885/mod_folder/intro/ID%206%20%285%29.pdf — the formal event calendar PDFs follow this URL pattern under the Bedelía course.

### 4.2 Plan de Estudios (Subject Catalogs) — PUBLIC, No Auth

Each career has a public "Plan de estudios" page listing ALL subjects organized by semester:

- **Sistemas:** https://fi.ort.edu.uy/ingenieria-en-sistemas/plan-de-estudios
- **Eléctrica:** https://fi.ort.edu.uy/ingenieria-electrica/plan-de-estudios
- **Biotecnología:** https://fi.ort.edu.uy/ingenieria-en-biotecnologia/plan-de-estudios
- **Electrónica:** https://fi.ort.edu.uy/ingenieria-en-electronica/plan-de-estudios

These pages provide the **semester grouping structure** (which semester each subject belongs to). However, the plan de estudios uses generic names for many subjects (e.g. "Materia de Gestión de la información (Big Data)"), while the Bedelía PDFs use the **actual specific subject names** (e.g. "Herramientas de software para Big Data"). The UI must show the real subject names from the PDFs, mapped to the correct semester using the plan de estudios structure.

**Mapping example (Sistemas, Semestre 7):**
| Plan de estudios (generic) | Bedelía PDF (actual) |
|---|---|
| Ingeniería de software ágil 2 | Ingeniería de software ágil 2 |
| Arquitectura de software | Arquitectura de software |
| Materia de Gestión de la información (Big Data) | Herramientas de software para Big Data |
| Materia de Seguridad informática | Aspectos de seguridad de sistemas informáticos |
| Inteligencia artificial | Inteligencia artificial |

This mapping is done once when parsing PDFs and stored in the JSON data.

### 4.3 Data Already Extracted

From a previous scraping session, 22 events for Ingeniería en Sistemas (Semester 7, 2026-1) are documented in `/Users/andresviera/Documents/Tools/aulas-context-summary.md`. This is the seed data for the MVP.

---

## 5. Architecture & Key Decisions

### 5.1 No Per-User AI Cost

The entire system runs on **pre-extracted, static data**. No AI inference happens at request time.

**How it works:**
1. Once per semester, a maintainer (Andrés) downloads the Bedelía PDFs
2. An AI-assisted script parses the PDFs into structured JSON
3. The JSON is committed to the repo
4. The web app reads from this static JSON

**Cost: $0 per user.** The only AI cost is the one-time PDF parsing (~$0.05 per semester).

### 5.2 No Authentication Required (for users)

Users never need to log into anything. The formal event data from Bedelía PDFs is the same for all students in a given career — it's not personalized. Students just select their career and optionally filter subjects.

### 5.3 Calendar Integration — Hosted .ics Subscription (Primary)

The primary integration is a **hosted .ics URL** that calendar apps subscribe to. This is the same mechanism used by public event calendars (sports schedules, holidays, etc.).

**How it works:**

The app exposes a Next.js API route that dynamically generates a valid `.ics` file from the static JSON data:

```
https://ortcal.aviera.me/api/cal/sistemas.ics
https://ortcal.aviera.me/api/cal/sistemas.ics?subjects=arq-software,ia,isa2
```

**Google Calendar (one click):**

The "Agregar a Google Calendar" button opens:
```
https://calendar.google.com/calendar/r?cid=https://ortcal.aviera.me/api/cal/sistemas.ics?subjects=arq-software,ia
```
Google Calendar shows "Add this calendar?" → student clicks Yes → all events appear. Google polls the URL every ~12-24h, so **if a date changes mid-semester, it auto-updates in the student's calendar.**

**Apple Calendar (one click):**

The "Agregar a Apple Calendar" button opens a `webcal://` link:
```
webcal://ortcal.aviera.me/api/cal/sistemas.ics?subjects=arq-software,ia
```
Apple Calendar opens and subscribes automatically.

**Outlook / Other (download fallback):**

A "Descargar .ics" button downloads the file for manual import.

**Why this is the best approach:**
- Zero OAuth, zero API keys, zero Google Cloud project
- One click + one confirmation for the student
- Auto-syncs if data changes (Google/Apple poll the URL)
- Subject filtering via query params — students only get events for their subjects
- Universal standard — works with any calendar app that supports iCalendar subscriptions

### 5.4 Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS v4 + shadcn/ui
- **Hosting:** Vercel (free tier), custom domain `ortcal.aviera.me` (DNS on Dynadot)
- **Data:** Static JSON files in the repo (`/data/semesters/2026-1/*.json`)
- **API Route:** `/api/cal/[career].ics` — generates .ics on the fly from JSON (supports subject filtering via query params)
- **PDF Parsing:** Python script using AI (Claude) for initial extraction, then deterministic validation
- **Calendar Generation:** `ics` npm package for .ics generation in the API route

### 5.5 Data Schema

```typescript
// /data/schema.ts
interface Semester {
  id: string;            // "2026-1"
  name: string;          // "1er Semestre 2026"
  startDate: string;     // "2026-03-09"
  endDate: string;       // "2026-08-15"
  careers: Career[];
}

interface Career {
  id: string;            // "sistemas"
  name: string;          // "Ingeniería en Sistemas"
  subjects: Subject[];
}

interface Subject {
  id: string;            // "arq-software"
  name: string;          // "Arquitectura de software" (actual name from Bedelía PDF)
  planName?: string;     // "Materia de Seguridad informática" (generic name from plan de estudios, only if different from name)
  code?: string;         // "715"
  semesterNumber: number; // 7 (which semester of the career this belongs to)
  events: AcademicEvent[];
}

interface AcademicEvent {
  id: string;
  type: "parcial" | "parcial_2da" | "entrega_obl" | "entrega_obl_2da" | "planteo_obl" | "entrega_ejercicios" | "consulta" | "cierre_curso";
  title: string;         // "PARCIAL 1 - Inteligencia artificial"
  date: string;          // "2026-05-12"
  startTime?: string;    // "10:00" (null for all-day events)
  endTime?: string;      // "12:00"
  allDay: boolean;
  notes?: string;        // "Noct. 17:30" or "Must register"
  source: "bedelia_pdf" | "aulas_manual";
}
```

---

## 6. Scope — What's In & What's Out

### Phase 1 (MVP — Ship by March 23, 2026)

**IN:**
- Web UI with career selection and subject filtering
- All **formal events** from Bedelía PDFs for all engineering careers
- Hosted .ics subscription endpoint (`/api/cal/[career].ics`) with subject filtering
- One-click Google Calendar subscribe button + Apple Calendar webcal:// link + .ics download fallback
- Calendar view showing all events visually
- Spanish-only UI
- Mobile responsive

**OUT (for now):**
- Informal events from Aulas course pages (requires per-user auth)
- User accounts or authentication
- OAuth-based calendar sync (subscription approach is used instead)
- Push notifications
- Non-engineering careers

### Phase 2 (Stretch — if time permits before April 3)

- Informal events: Allow students to submit/crowdsource informal event dates manually through the UI (no scraping needed — community-driven approach)
- Multiple semesters (historical archive)

### Phase 3 (Future — post-Puentes)

- Browser extension that reads aulas.ort.edu.uy while the student is logged in and extracts informal events client-side (no server auth needed)
- Crowdsourced corrections (if a date changes, students can flag it)
- Expand to non-engineering careers

---

## 7. Handling the Two Main Challenges

### Challenge 1: Authentication for Data Retrieval

**For formal events (Bedelía PDFs):**
- **Solution:** Andrés downloads PDFs once per semester and commits parsed data to the repo
- **Maintenance:** If PDFs change mid-semester (rare), re-download and re-parse
- **Scalability:** Any ORT student with access could contribute PDF downloads via PR
- **Cost:** Zero recurring cost

**For informal events (Aulas course pages):**
- **MVP solution:** Skip entirely — formal events cover 80%+ of the value
- **Future solution options (ranked by feasibility):**
  1. **Crowdsource:** Let students manually add informal events via the UI — community maintains accuracy
  2. **Browser extension:** A lightweight Chrome extension that, when the student visits aulas.ort.edu.uy, extracts dates from the page DOM client-side and offers to add them to the calendar — no server-side auth needed, runs in the student's authenticated browser session
  3. **Session token approach (like Open Club):** Student pastes their Moodle session cookie — technically works but bad UX and security implications

### Challenge 2: AI Costs

**Formal events parsing:**
- One-time cost per semester: ~$0.05-0.10 using Claude to parse PDFs into JSON
- After initial parsing, everything is deterministic (static JSON)
- Self-healing: If PDF format changes, re-run AI parsing script (~$0.05)

**No per-user AI costs at all.** The product serves static, pre-extracted data.

**Comparison with the agentic approach:**
| Approach | Cost/user | Auth needed | Reliability |
|----------|-----------|-------------|-------------|
| Full agentic (what you did manually) | ~$0.50-1.00 | Yes (Aulas + Google) | High but expensive |
| This product (static data + .ics) | $0 | No | Very high for formal events |

---

## 8. PDF Parsing Pipeline

### 7.1 One-Time Setup (per semester)

```
1. Download Bedelía PDFs (one per career/semester group)
2. Run: python scripts/parse_pdf.py --input pdfs/ --output data/semesters/2026-1/
3. AI extracts events → structured JSON
4. Human reviews JSON for accuracy
5. Commit to repo → Vercel auto-deploys
```

### 7.2 Parser Script (`scripts/parse_pdf.py`)

- Uses `PyMuPDF` (fitz) or `pdfplumber` to extract text from PDFs
- Sends extracted text to Claude API for structured extraction
- Claude returns JSON matching the `AcademicEvent` schema
- Script validates the output (dates are valid, types are valid, etc.)
- Outputs one JSON file per career

**Deterministic fallback:** After AI generates the initial parse, store the parsing logic as a deterministic script. If the PDF format doesn't change (which it rarely does within a university), the deterministic parser handles it. AI is only needed when the format changes.

### 7.3 Self-Healing (GitHub Actions)

```yaml
# .github/workflows/validate-data.yml
# Runs weekly during semester to check if PDFs have been updated
# If parsing fails, opens an issue (human reviews)
```

---

## 9. UI Design

### 8.1 Pages

**`/` — Home (and only real page)**
- Header: "ORT Calendar" + current semester badge
- Career selector (dropdown or tabs for the 4 engineering careers)
- Subject selector: all subjects grouped by semester number (checkboxes, none selected by default — student checks only the ones they're enrolled in). Must support selecting subjects from different semesters (e.g. retaking a semester 5 subject while in semester 7). **Shows the actual subject names from the Bedelía PDFs, not the generic plan de estudios names** (e.g. "Herramientas de software para Big Data" not "Materia de Gestión de la información").
- Calendar view (month view, events color-coded by type)
- Action bar: Primary **"Agregar a Google Calendar"** button (subscription link) + **"Apple Calendar"** (webcal:// link) + secondary **"Descargar .ics"** (download fallback)
- Footer: minimal — just a GitHub link and "Open source" text. No cheesy slogans.

**`/about` — About page**
- What this is, how it works, how to contribute
- Link to GitHub repo

### 8.2 Design Principles

- **Clean and sharp:** Dark or neutral palette, modern typography, no cute/playful vibes — should feel like a tool, not a school project
- **Mobile-first:** Most students will access from their phones
- **Fast:** Static site, no loading spinners, instant render
- **Spanish:** All UI text in Spanish (this is for Uruguayan students)
- **No signup:** Zero friction, zero accounts

### 8.3 Color Coding for Event Types

| Type | Color | Label |
|------|-------|-------|
| Parcial | Red | Parcial |
| Parcial 2da instancia | Orange | 2da Inst. Parcial |
| Entrega obligatorio | Blue | Entrega OBL |
| Entrega 2da instancia | Light blue | 2da Inst. Entrega |
| Planteo obligatorio | Green | Planteo OBL |
| Consulta | Gray | Consulta |
| Cierre curso | Dark gray | Cierre |

---

## 10. Project Structure

```
semester-events/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Main page with calendar
│   ├── about/page.tsx
│   ├── api/cal/[career]/route.ts # .ics API route (subscription endpoint)
│   └── globals.css
├── components/
│   ├── career-selector.tsx
│   ├── subject-filter.tsx
│   ├── calendar-view.tsx
│   ├── event-card.tsx
│   ├── action-bar.tsx            # Subscribe/download buttons
│   └── ui/                       # shadcn components
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── ics-generator.ts          # .ics file generation (used by API route)
│   ├── calendar-links.ts         # Google Calendar & webcal URL builders
│   └── data.ts                   # Data loading utilities
├── data/
│   └── semesters/
│       └── 2026-1/
│           ├── sistemas.json
│           ├── electrica.json
│           ├── biotecnologia.json
│           └── electronica.json
├── scripts/
│   ├── parse_pdf.py              # AI-assisted PDF parser
│   ├── validate_data.py          # Data validation script
│   └── requirements.txt
├── pdfs/                         # Raw Bedelía PDFs (gitignored or committed)
│   └── 2026-1/
├── public/
│   └── og-image.png
├── SPEC.md                       # This file
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 11. Implementation Plan

### Step 1: Project Setup (~15 min)
- Init Next.js 15 with App Router, Tailwind v4, TypeScript
- Install shadcn/ui, ics package
- Set up project structure

### Step 2: Data Layer (~30 min)
- Define TypeScript types
- Create sample JSON data (from the 22 events already extracted in aulas-context-summary.md)
- Build data loading utilities

### Step 3: PDF Parser Script (~30 min)
- Python script that extracts text from PDFs
- Sends to Claude API for structured extraction
- Validates and outputs JSON
- Run on existing PDFs to populate data/

### Step 4: Core UI (~1 hour)
- Career selector component
- Subject filter component
- Calendar month view (can use a lightweight calendar lib or build simple grid)
- Event cards with color coding
- Mobile responsive layout

### Step 5: Calendar API Route & Export (~30 min)
- `/api/cal/[career]/route.ts` — generates .ics from JSON, supports `?subjects=` query param filtering
- Google Calendar subscription URL builder (`https://calendar.google.com/calendar/r?cid=...`)
- Apple Calendar webcal:// URL builder
- .ics download fallback
- Action bar component with all three buttons

### Step 6: Repository & Deploy (~30 min)
- Init git repo, create GitHub repo (public, `andresvn/ort-calendar` or similar)
- Push code to GitHub
- Connect to Vercel via `vercel` CLI (link to GitHub repo)
- Add custom domain `ortcal.aviera.me` in Vercel project settings
- Configure DNS on Dynadot: add CNAME record `calendar` → `cname.vercel-dns.com` (via Dynadot web UI using browser automation at https://www.dynadot.com/account/domain/name/list.html)
- Verify domain in Vercel, confirm SSL is working
- Test full flow: visit ortcal.aviera.me → select career → subscribe to Google Calendar

### Step 7: Polish (~15 min)
- OG image, favicon
- About page
- Test on mobile

**Total estimated work: ~3-4 hours of focused Ralph Loop execution**

---

## 12. Data We Already Have

From the previous scraping session (aulas-context-summary.md), we have 22 events for Ingeniería en Sistemas, Semester 7 (2026-1):

- 6 Planteo OBL events
- 5 Parcial events (with times)
- 5 Entrega OBL events
- 1 Combined Parcial + Entrega
- 1 Parcial Big Data
- 4 Segunda Instancia events

Plus consultation dates and course closing dates.

**This data should be used to seed the initial `sistemas.json` file.** For other careers, we need their respective PDFs.

---

## 13. Future: The Browser Extension Approach (Phase 3)

For informal events without requiring server-side authentication:

1. Student installs a Chrome extension
2. When they visit `aulas.ort.edu.uy`, the extension reads the page DOM
3. It extracts any dates/events from course pages using pattern matching + lightweight local AI
4. Shows a popup: "Found 3 upcoming dates. Add to calendar?"
5. Generates .ics or uses Google Calendar API

**Why this solves the auth problem:** The extension runs in the student's browser where they're already logged into Aulas. No credentials ever leave the browser. No server-side auth needed.

---

## 14. Success Metrics

- Students from at least 2 different careers use the tool
- Tool is shared in ORT WhatsApp groups or social media
- GitHub repo gets stars/contributions from other ORT students
- Andrés can reference this in Puentes application as a shipped product

---

## 15. Open Questions

1. **How many engineering careers are there exactly?** Need to confirm the full list to know how many PDFs to download.
2. **Do all careers share the same PDF format?** If yes, one parser handles all. If not, may need per-career adjustments.
3. **Can Bedelía PDFs be accessed without auth?** If the direct URL works without login, we could even automate the download.
4. **Is there interest from other students?** Validate by sharing the idea in a WhatsApp group before over-building.

---

## 16. Deployment & Infrastructure

### Domain: `ortcal.aviera.me`
- **Registrar:** Dynadot (https://www.dynadot.com/account/domain/name/list.html)
- **DNS:** Add CNAME record: `calendar` → `cname.vercel-dns.com`
- **Hosting:** Vercel (free tier)
- **Repo:** Public GitHub repo under andresvn (or andres-vieira, check which GitHub account is active)

### Deploy Checklist
1. Create GitHub repo (public)
2. Push all code
3. `vercel` CLI: link project, deploy
4. Add `ortcal.aviera.me` as custom domain in Vercel
5. Add CNAME in Dynadot DNS settings
6. Verify SSL + domain resolution
7. Test .ics subscription URL works from the custom domain

---

## 17. Ralph Loop Command

Once this spec is approved, run this command:

```
/ralph-loop:ralph-loop Build and fully deploy the ORT Calendar project following the spec at /Users/andresviera/Documents/Tools/semester-events/SPEC.md. You must complete ALL of the following:

1. SETUP: Init Next.js 15 project with App Router, Tailwind v4, TypeScript, shadcn/ui in /Users/andresviera/Documents/Tools/semester-events/. Install the `ics` npm package.

2. DATA: Scrape the 4 Plan de Estudios pages (public, no auth) to get the complete subject catalog per career:
   - https://fi.ort.edu.uy/ingenieria-en-sistemas/plan-de-estudios
   - https://fi.ort.edu.uy/ingenieria-electrica/plan-de-estudios
   - https://fi.ort.edu.uy/ingenieria-en-biotecnologia/plan-de-estudios
   - https://fi.ort.edu.uy/ingenieria-en-electronica/plan-de-estudios
   Then seed sistemas.json with the 22 events from /Users/andresviera/Documents/Tools/aulas-context-summary.md. Other careers will have subjects listed but no events yet (events TBD when PDFs are parsed). Follow the schema in the spec.

3. UI: Build the full Spanish, mobile-first, minimalistic UI — career selector, subject filter (checkboxes), calendar month view with color-coded events, action bar with "Agregar a Google Calendar" (subscription link), "Apple Calendar" (webcal://), and "Descargar .ics" (download). See spec sections 9-10 for details.

4. API ROUTE: Build /api/cal/[career]/route.ts that generates valid .ics from the JSON data, supporting ?subjects= query param filtering.

5. REPO: Init git, create a PUBLIC GitHub repo, push all code.

6. DEPLOY: Deploy to Vercel via CLI. Add custom domain ortcal.aviera.me. Use browser automation (Claude in Chrome MCP) to go to https://www.dynadot.com/account/domain/name/list.html and add a CNAME record for `calendar` pointing to `cname.vercel-dns.com` on the aviera.me domain. Verify the domain works with SSL.

7. VERIFY: Visit ortcal.aviera.me in the browser and confirm everything works — calendar renders, events show, .ics download works, Google Calendar subscribe link works.

Do NOT build the PDF parser script. Focus on the web app + deployment. Come back only when the product is live at ortcal.aviera.me.
```

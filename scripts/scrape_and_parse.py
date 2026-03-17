#!/usr/bin/env python3
"""
ORT Calendar — Bedelía PDF Scraper & Parser

Scrapes all event calendar PDFs from ORT's Bedelía page (Aulas/Moodle),
parses them with Claude API, and outputs structured JSON for the web app.

Usage:
    # Set environment variables
    export AULAS_MOODLE_SESSION="your_moodle_session_cookie"
    export ANTHROPIC_API_KEY="your_anthropic_api_key"

    # Run
    python scripts/scrape_and_parse.py

    # Or specify semester
    python scripts/scrape_and_parse.py --semester 2026-1
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, unquote

import anthropic
import pdfplumber
import requests
from bs4 import BeautifulSoup

# ─── Constants ───────────────────────────────────────────────────────────────

BEDELIA_URL = "https://aulas.ort.edu.uy/course/view.php?id=1616"
AULAS_BASE = "https://aulas.ort.edu.uy"

# Career mapping: known keywords in PDF names/folder names → career ID
CAREER_KEYWORDS = {
    "sistemas": "sistemas",
    "system": "sistemas",
    "eléctrica": "electrica",
    "electrica": "electrica",
    "electrical": "electrica",
    "biotecnología": "biotecnologia",
    "biotecnologia": "biotecnologia",
    "biotech": "biotecnologia",
    "electrónica": "electronica",
    "electronica": "electronica",
    "electronic": "electronica",
}

CAREER_NAMES = {
    "sistemas": "Ingeniería en Sistemas",
    "electrica": "Ingeniería Eléctrica",
    "biotecnologia": "Ingeniería en Biotecnología",
    "electronica": "Ingeniería en Electrónica",
}

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "src" / "data" / "semesters"
PDF_DIR = PROJECT_ROOT / "pdfs"

# ─── Session Setup ───────────────────────────────────────────────────────────

def create_session(moodle_session: str) -> requests.Session:
    """Create an authenticated requests session using the MoodleSession cookie."""
    session = requests.Session()
    session.cookies.set("MoodleSession", moodle_session, domain="aulas.ort.edu.uy")
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    })
    return session


def verify_session(session: requests.Session) -> bool:
    """Verify the session is authenticated by checking the Bedelía page."""
    resp = session.get(BEDELIA_URL, allow_redirects=False)
    if resp.status_code == 303 or resp.status_code == 302:
        print("ERROR: Session is not authenticated (redirected to login)")
        return False
    if resp.status_code != 200:
        print(f"ERROR: Unexpected status code {resp.status_code}")
        return False
    if "Acceder" in resp.text and "login" in resp.url:
        print("ERROR: Session is not authenticated")
        return False
    print("Session verified - authenticated successfully")
    return True

# ─── Scraping ────────────────────────────────────────────────────────────────

def scrape_pdf_links(session: requests.Session) -> list[dict]:
    """
    Scrape the Bedelía page for all PDF links.
    Returns list of {url, filename, career_hint, semester_hint}.
    """
    resp = session.get(BEDELIA_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    pdf_links = []

    # Find all links that point to PDF files
    for link in soup.find_all("a", href=True):
        href = link["href"]
        text = link.get_text(strip=True)

        # Match PDF links (pluginfile URLs or direct .pdf links)
        if ".pdf" in href.lower() or "pluginfile" in href.lower():
            # Normalize URL
            if href.startswith("/"):
                href = urljoin(AULAS_BASE, href)

            # Try to extract filename from URL
            filename = unquote(href.split("/")[-1]) if "/" in href else text
            if not filename.endswith(".pdf"):
                filename += ".pdf"

            # Try to detect career and semester from filename/text
            career_hint = detect_career(filename + " " + text)
            semester_hint = detect_semester_number(filename + " " + text)

            pdf_links.append({
                "url": href,
                "filename": filename,
                "text": text,
                "career_hint": career_hint,
                "semester_hint": semester_hint,
            })

    # Also check for folder resources (Moodle folders containing PDFs)
    for folder_link in soup.find_all("a", href=re.compile(r"mod/folder")):
        folder_url = folder_link["href"]
        if folder_url.startswith("/"):
            folder_url = urljoin(AULAS_BASE, folder_url)
        folder_text = folder_link.get_text(strip=True)
        print(f"  Found folder: {folder_text} → {folder_url}")

        # Fetch folder contents
        try:
            folder_resp = session.get(folder_url)
            folder_resp.raise_for_status()
            folder_soup = BeautifulSoup(folder_resp.text, "html.parser")

            for flink in folder_soup.find_all("a", href=True):
                fhref = flink["href"]
                ftext = flink.get_text(strip=True)
                if ".pdf" in fhref.lower() or ("pluginfile" in fhref.lower() and ftext):
                    if fhref.startswith("/"):
                        fhref = urljoin(AULAS_BASE, fhref)
                    fname = unquote(fhref.split("/")[-1]) if "/" in fhref else ftext
                    if not fname.endswith(".pdf"):
                        fname += ".pdf"

                    career_hint = detect_career(fname + " " + ftext + " " + folder_text)
                    semester_hint = detect_semester_number(fname + " " + ftext + " " + folder_text)

                    pdf_links.append({
                        "url": fhref,
                        "filename": fname,
                        "text": ftext,
                        "folder": folder_text,
                        "career_hint": career_hint,
                        "semester_hint": semester_hint,
                    })
        except Exception as e:
            print(f"  Warning: Could not fetch folder {folder_url}: {e}")

    # Deduplicate by URL
    seen = set()
    unique = []
    for link in pdf_links:
        if link["url"] not in seen:
            seen.add(link["url"])
            unique.append(link)

    return unique


def detect_career(text: str) -> str | None:
    """Detect career from text using keywords."""
    text_lower = text.lower()
    for keyword, career_id in CAREER_KEYWORDS.items():
        if keyword in text_lower:
            return career_id
    return None


def detect_semester_number(text: str) -> int | None:
    """Try to detect semester number from text like 'ID 6', 'Semestre 3', etc."""
    # Pattern: "ID X", "ID X (Y)", semester number references
    patterns = [
        r"ID\s*(\d+)",
        r"[Ss]emestre\s*(\d+)",
        r"[Ss]em\.?\s*(\d+)",
        r"S(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            num = int(match.group(1))
            if 1 <= num <= 10:
                return num
    return None

# ─── PDF Download ────────────────────────────────────────────────────────────

def download_pdfs(session: requests.Session, pdf_links: list[dict], semester: str) -> list[dict]:
    """Download all PDFs to the pdfs/ directory."""
    semester_pdf_dir = PDF_DIR / semester
    semester_pdf_dir.mkdir(parents=True, exist_ok=True)

    downloaded = []
    for i, link in enumerate(pdf_links):
        # Sanitize filename
        safe_name = re.sub(r'[^\w\s\-\.]', '_', link["filename"])
        filepath = semester_pdf_dir / safe_name

        if filepath.exists():
            print(f"  [{i+1}/{len(pdf_links)}] Already exists: {safe_name}")
            link["local_path"] = str(filepath)
            downloaded.append(link)
            continue

        print(f"  [{i+1}/{len(pdf_links)}] Downloading: {safe_name}...")
        try:
            resp = session.get(link["url"], stream=True)
            resp.raise_for_status()

            with open(filepath, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)

            link["local_path"] = str(filepath)
            downloaded.append(link)
            time.sleep(0.5)  # Be nice to the server
        except Exception as e:
            print(f"  ERROR downloading {safe_name}: {e}")

    return downloaded

# ─── PDF Parsing ─────────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF using pdfplumber."""
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

            # Also try tables
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row:
                        text_parts.append(" | ".join(str(cell or "") for cell in row))

    return "\n".join(text_parts)


def parse_pdf_with_claude(client: anthropic.Anthropic, pdf_text: str, pdf_info: dict) -> dict | None:
    """
    Use Claude API to parse PDF text into structured event data.
    Returns a dict with subjects and their events, including turno classification.
    """
    prompt = f"""You are parsing a university event calendar PDF from Universidad ORT Uruguay's Bedelía (academic office).

This PDF contains evaluation dates (parciales, entregas de obligatorio, planteos, consultas, etc.) for multiple subjects in a specific career and semester.

IMPORTANT: Events often have different times for different "turnos" (shifts):
- **Matutino** (morning shift): typically classes from ~8:00-13:00
- **Vespertino** (afternoon shift): typically classes from ~13:00-18:00
- **Nocturno** (night shift): typically classes from ~18:00-22:00

When the PDF shows different times for different shifts (e.g., "Mat. 10:00 / Noct. 19:30"), create SEPARATE events for each turno.

PDF filename: {pdf_info.get('filename', 'unknown')}
PDF folder context: {pdf_info.get('folder', 'N/A')}
Career hint: {pdf_info.get('career_hint', 'unknown')}
Semester hint: {pdf_info.get('semester_hint', 'unknown')}

Here is the extracted text from the PDF:

---
{pdf_text}
---

Parse this into the following JSON structure. Be thorough — extract EVERY event for EVERY subject mentioned.

Return ONLY valid JSON (no markdown, no explanation):

{{
  "career_id": "sistemas|electrica|biotecnologia|electronica",
  "career_name": "Full career name",
  "semester_numbers": [list of semester numbers covered by this PDF],
  "subjects": [
    {{
      "name": "Exact subject name as shown in the PDF",
      "semester_number": 7,
      "events": [
        {{
          "type": "parcial|parcial_2da|entrega_obl|entrega_obl_2da|planteo_obl|entrega_ejercicios|consulta|cierre_curso",
          "title": "PARCIAL - Subject Name",
          "date": "2026-MM-DD",
          "start_time": "HH:MM or null",
          "end_time": "HH:MM or null",
          "all_day": true/false,
          "turno": "matutino|vespertino|nocturno|null",
          "notes": "Any additional notes or null"
        }}
      ]
    }}
  ]
}}

Rules:
1. Use the EXACT subject names from the PDF
2. Dates must be in YYYY-MM-DD format
3. Times in HH:MM 24-hour format
4. For all-day events (no specific time), set all_day: true, start_time: null, end_time: null
5. Event types:
   - "parcial" = exam/test
   - "parcial_2da" = second chance exam
   - "entrega_obl" = mandatory assignment delivery
   - "entrega_obl_2da" = second chance assignment delivery
   - "planteo_obl" = assignment announcement/briefing
   - "entrega_ejercicios" = exercise delivery
   - "consulta" = consultation session
   - "cierre_curso" = course closing
6. For turno:
   - If the event clearly states "Mat." or "Matutino" → "matutino"
   - If "Vesp." or "Vespertino" → "vespertino"
   - If "Noct." or "Nocturno" → "nocturno"
   - If no turno specified or applies to all shifts → null
7. When an event has DIFFERENT times for different turnos, create SEPARATE event entries with the turno field set
8. Infer the year from context (current academic year is 2026)
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}],
        )

        text = response.content[0].text.strip()

        # Try to extract JSON from the response
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*\n?", "", text)
            text = re.sub(r"\n?```\s*$", "", text)

        return json.loads(text)

    except json.JSONDecodeError as e:
        print(f"  ERROR: Could not parse Claude response as JSON: {e}")
        print(f"  Response text: {text[:500]}...")
        return None
    except Exception as e:
        print(f"  ERROR calling Claude API: {e}")
        return None

# ─── JSON Output ─────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    """Convert a subject name to a URL-friendly slug."""
    # Remove accents
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "ñ": "n", "ü": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "Ñ": "N",
    }
    result = name.lower()
    for k, v in replacements.items():
        result = result.replace(k, v)
    # Keep only alphanumeric, spaces, hyphens
    result = re.sub(r"[^\w\s-]", "", result)
    # Replace spaces with hyphens
    result = re.sub(r"\s+", "-", result.strip())
    # Remove consecutive hyphens
    result = re.sub(r"-+", "-", result)
    return result


def build_career_json(career_id: str, parsed_results: list[dict], existing_data: dict | None = None) -> dict:
    """
    Build the final career JSON by merging parsed PDF results.
    If existing_data is provided, merge new events into existing subjects.
    """
    career_name = CAREER_NAMES.get(career_id, career_id)

    # Start with existing subjects or empty
    subjects_map: dict[str, dict] = {}

    if existing_data and "subjects" in existing_data:
        for subj in existing_data["subjects"]:
            subjects_map[subj["name"].lower()] = subj

    # Merge parsed results
    for result in parsed_results:
        if not result or "subjects" not in result:
            continue

        for subj in result["subjects"]:
            subj_key = subj["name"].lower()

            if subj_key not in subjects_map:
                subj_id = slugify(subj["name"])
                subjects_map[subj_key] = {
                    "id": subj_id,
                    "name": subj["name"],
                    "semesterNumber": subj.get("semester_number", 0),
                    "events": [],
                }

            # Add events
            existing_subj = subjects_map[subj_key]
            existing_event_ids = {e["id"] for e in existing_subj["events"]}

            for event in subj.get("events", []):
                event_id = f"{existing_subj['id']}-{slugify(event['type'])}"
                # Add turno suffix if specified
                if event.get("turno"):
                    event_id += f"-{event['turno'][:3]}"
                # Add date suffix to make unique
                if event.get("date"):
                    event_id += f"-{event['date'][-5:]}"  # MM-DD

                # Deduplicate
                counter = 0
                base_id = event_id
                while event_id in existing_event_ids:
                    counter += 1
                    event_id = f"{base_id}-{counter}"

                existing_event_ids.add(event_id)

                new_event = {
                    "id": event_id,
                    "type": event["type"],
                    "title": event.get("title", f"{event['type'].upper()} - {subj['name']}"),
                    "date": event["date"],
                    "allDay": event.get("all_day", True),
                    "source": "bedelia_pdf",
                }

                if event.get("start_time"):
                    new_event["startTime"] = event["start_time"]
                    new_event["allDay"] = False
                if event.get("end_time"):
                    new_event["endTime"] = event["end_time"]
                if event.get("turno"):
                    new_event["turno"] = event["turno"]
                if event.get("notes"):
                    new_event["notes"] = event["notes"]

                existing_subj["events"].append(new_event)

    # Sort subjects by semester number, then name
    subjects_list = sorted(subjects_map.values(), key=lambda s: (s["semesterNumber"], s["name"]))

    return {
        "id": career_id,
        "name": career_name,
        "subjects": subjects_list,
    }


def save_career_json(career_data: dict, semester: str):
    """Save career data to JSON file."""
    output_dir = DATA_DIR / semester
    output_dir.mkdir(parents=True, exist_ok=True)

    filepath = output_dir / f"{career_data['id']}.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(career_data, f, ensure_ascii=False, indent=2)

    total_events = sum(len(s["events"]) for s in career_data["subjects"])
    print(f"  Saved {filepath.name}: {len(career_data['subjects'])} subjects, {total_events} events")

# ─── Main Pipeline ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape and parse ORT Bedelía PDFs")
    parser.add_argument("--semester", default="2026-1", help="Semester ID (e.g., 2026-1)")
    parser.add_argument("--skip-download", action="store_true", help="Skip PDF download, use existing files")
    parser.add_argument("--skip-parse", action="store_true", help="Skip PDF parsing, just download")
    parser.add_argument("--pdf-dir", help="Override PDF directory path")
    args = parser.parse_args()

    # Check environment variables
    moodle_session = os.environ.get("AULAS_MOODLE_SESSION")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")

    if not moodle_session and not args.skip_download:
        print("ERROR: AULAS_MOODLE_SESSION environment variable not set")
        print("To get your session cookie:")
        print("  1. Log into https://aulas.ort.edu.uy")
        print("  2. Open DevTools → Application → Cookies → MoodleSession")
        print("  3. Copy the value")
        print("  4. export AULAS_MOODLE_SESSION='your_value_here'")
        sys.exit(1)

    if not anthropic_key and not args.skip_parse:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        print("  export ANTHROPIC_API_KEY='your_key_here'")
        sys.exit(1)

    print(f"=== ORT Calendar — PDF Scraper & Parser ===")
    print(f"Semester: {args.semester}")
    print()

    # Step 1: Scrape PDF links from Bedelía
    downloaded_pdfs = []

    if not args.skip_download:
        print("Step 1: Authenticating and scraping Bedelía page...")
        session = create_session(moodle_session)
        if not verify_session(session):
            sys.exit(1)

        print("\nStep 2: Finding PDF links...")
        pdf_links = scrape_pdf_links(session)
        print(f"  Found {len(pdf_links)} PDF links")
        for link in pdf_links:
            career = link.get("career_hint", "?")
            sem = link.get("semester_hint", "?")
            print(f"    - {link['filename']} (career: {career}, sem: {sem})")

        if not pdf_links:
            print("ERROR: No PDF links found on the Bedelía page")
            print("The page structure may have changed. Check manually.")
            sys.exit(1)

        print(f"\nStep 3: Downloading {len(pdf_links)} PDFs...")
        downloaded_pdfs = download_pdfs(session, pdf_links, args.semester)
        print(f"  Downloaded {len(downloaded_pdfs)} PDFs")
    else:
        # Use existing PDFs
        pdf_source = Path(args.pdf_dir) if args.pdf_dir else PDF_DIR / args.semester
        if not pdf_source.exists():
            print(f"ERROR: PDF directory not found: {pdf_source}")
            sys.exit(1)

        for pdf_file in sorted(pdf_source.glob("*.pdf")):
            downloaded_pdfs.append({
                "local_path": str(pdf_file),
                "filename": pdf_file.name,
                "career_hint": detect_career(pdf_file.name),
                "semester_hint": detect_semester_number(pdf_file.name),
            })
        print(f"Using {len(downloaded_pdfs)} existing PDFs from {pdf_source}")

    if args.skip_parse:
        print("Skipping parse step (--skip-parse)")
        return

    # Step 4: Parse PDFs with Claude
    print(f"\nStep 4: Parsing {len(downloaded_pdfs)} PDFs with Claude API...")
    client = anthropic.Anthropic(api_key=anthropic_key)

    # Group parsed results by career
    career_results: dict[str, list[dict]] = {}

    for i, pdf_info in enumerate(downloaded_pdfs):
        pdf_path = pdf_info["local_path"]
        print(f"\n  [{i+1}/{len(downloaded_pdfs)}] Parsing: {pdf_info['filename']}")

        # Extract text
        pdf_text = extract_text_from_pdf(pdf_path)
        if not pdf_text.strip():
            print(f"    WARNING: No text extracted from {pdf_info['filename']}")
            continue

        print(f"    Extracted {len(pdf_text)} chars of text")

        # Parse with Claude
        result = parse_pdf_with_claude(client, pdf_text, pdf_info)
        if result:
            career_id = result.get("career_id", pdf_info.get("career_hint", "unknown"))
            if career_id not in career_results:
                career_results[career_id] = []
            career_results[career_id].append(result)

            subj_count = len(result.get("subjects", []))
            event_count = sum(len(s.get("events", [])) for s in result.get("subjects", []))
            print(f"    Parsed: {subj_count} subjects, {event_count} events")
        else:
            print(f"    WARNING: Failed to parse {pdf_info['filename']}")

        time.sleep(1)  # Rate limiting

    # Step 5: Build and save JSON files
    print(f"\nStep 5: Building JSON files...")
    for career_id, results in career_results.items():
        # Try to load existing data to preserve manually-added events
        existing_path = DATA_DIR / args.semester / f"{career_id}.json"
        existing_data = None
        if existing_path.exists():
            with open(existing_path) as f:
                existing_data = json.load(f)

        career_json = build_career_json(career_id, results, existing_data)
        save_career_json(career_json, args.semester)

    print(f"\n=== Done! ===")
    total_careers = len(career_results)
    total_events = sum(
        sum(len(s.get("events", [])) for s in r.get("subjects", []))
        for results in career_results.values()
        for r in results
    )
    print(f"Processed {total_careers} careers, {total_events} total events")
    print(f"JSON files saved to: {DATA_DIR / args.semester}")


if __name__ == "__main__":
    main()

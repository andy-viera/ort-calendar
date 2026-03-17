#!/usr/bin/env python3
"""
Parse ORT event calendar PDFs using Claude API.
Reads PDFs from pdfs/2026-1/, sends to Claude for structured extraction,
and outputs JSON to src/data/semesters/2026-1/.

Usage:
    export ANTHROPIC_API_KEY="your_key"
    python3 scripts/parse_pdf.py
"""
import anthropic
import base64
import json
import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
PDF_DIR = PROJECT_ROOT / "pdfs" / "2026-1"
DATA_DIR = PROJECT_ROOT / "src" / "data" / "semesters" / "2026-1"

PROMPT = """You are parsing a university event calendar PDF from Universidad ORT Uruguay's Bedelía.

This PDF contains evaluation dates for Ingeniería en Sistemas, for the specified semester(s).
The academic period is MARZO 2026 (first semester 2026, starting March 2026).

CRITICAL RULES:
1. Extract EVERY event (parcial, entrega, planteo, consulta, cierre, 2da instancia) for EVERY subject
2. Dates are in the format Day/Month within the calendar grid. The year is 2026.
3. When events have DIFFERENT times for different "turnos" (shifts), create SEPARATE events:
   - "Mat." or "Matutino" → turno: "matutino" (morning)
   - "Noct." or "Nocturno" → turno: "nocturno" (night)
   - "Vesp." or "Vespertino" → turno: "vespertino" (afternoon)
   - "Todos:" means ALL turnos → turno: null
4. Event types:
   - "Parcial 1", "Parcial 2" → type: "parcial"
   - "2da Instancia Parcial" / "2da. Instancia" → type: "parcial_2da"
   - "Entrega OBL" / "ENTREGA OBL" → type: "entrega_obl"
   - "2da Instancia Entrega" → type: "entrega_obl_2da"
   - "Planteo OBL" → type: "planteo_obl"
   - "Entrega de Ejercicios" / "Entrega Ejercicios" → type: "entrega_ejercicios"
   - "consulta" / "clase de consulta" → type: "consulta"
   - "Cierre" / "cierre de curso" → type: "cierre_curso"
5. Times should be in 24-hour HH:MM format
6. For all-day events (no specific time), set all_day: true
7. Include the subject code if shown (e.g., "Programación 1 (1479)" → code: "1479")
8. For "Fin del semestre", skip it (it's not an evaluation event)
9. For "NO hay clases", "Universidad Cerrada", "Feriado", skip these too

Return ONLY valid JSON array of subjects:
[
  {
    "name": "Subject Name",
    "code": "1234",
    "semester_number": 1,
    "events": [
      {
        "type": "parcial",
        "title": "Parcial 1 - Subject Name",
        "date": "2026-04-28",
        "start_time": "14:00",
        "end_time": "16:00",
        "all_day": false,
        "turno": "matutino",
        "notes": "any extra notes or null"
      }
    ]
  }
]
"""


def slugify(name: str) -> str:
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "ñ": "n", "ü": "u", "Á": "A", "É": "E", "Í": "I",
        "Ó": "O", "Ú": "U", "Ñ": "N",
    }
    result = name.lower()
    for k, v in replacements.items():
        result = result.replace(k, v)
    result = re.sub(r"[^\w\s-]", "", result)
    result = re.sub(r"\s+", "-", result.strip())
    result = re.sub(r"-+", "-", result)
    return result


def parse_pdf_with_claude(client: anthropic.Anthropic, pdf_path: Path, semester_hint: int) -> list:
    """Send PDF to Claude API for structured extraction."""
    with open(pdf_path, "rb") as f:
        pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_data,
                    },
                },
                {
                    "type": "text",
                    "text": PROMPT + f"\n\nThis PDF is for Semester {semester_hint} of Ingeniería en Sistemas.",
                },
            ],
        }],
    )

    text = response.content[0].text.strip()
    # Remove markdown fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)

    return json.loads(text)


def build_career_json(all_subjects: list, existing_path: Path) -> dict:
    """Build the final career JSON merging parsed results with existing data."""
    # Load existing data
    existing = {}
    if existing_path.exists():
        with open(existing_path) as f:
            existing = json.load(f)

    # Build subjects map from existing (keep subjects that have no new data)
    subjects_map = {}
    if "subjects" in existing:
        for subj in existing["subjects"]:
            subjects_map[subj["name"].lower()] = subj

    # Merge new parsed subjects
    for subj in all_subjects:
        subj_key = subj["name"].lower()
        subj_id = slugify(subj["name"])

        if subj_key in subjects_map:
            # Update existing subject with new events
            existing_subj = subjects_map[subj_key]
            existing_subj["events"] = []  # Replace all events from PDFs
        else:
            existing_subj = {
                "id": subj_id,
                "name": subj["name"],
                "semesterNumber": subj.get("semester_number", 0),
                "events": [],
            }
            subjects_map[subj_key] = existing_subj

        if subj.get("code"):
            existing_subj["code"] = subj["code"]

        # Add events
        existing_event_ids = set()
        for event in subj.get("events", []):
            event_id = f"{subj_id}-{slugify(event['type'])}"
            if event.get("turno"):
                event_id += f"-{event['turno'][:3]}"
            if event.get("date"):
                event_id += f"-{event['date'][-5:]}"

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

    subjects_list = sorted(subjects_map.values(), key=lambda s: (s["semesterNumber"], s["name"]))

    return {
        "id": existing.get("id", "sistemas"),
        "name": existing.get("name", "Ingeniería en Sistemas"),
        "subjects": subjects_list,
    }


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Find all PDFs
    pdf_files = sorted(PDF_DIR.glob("sistemas_sem*.pdf"))
    electivas_pdf = PDF_DIR / "sistemas_electivas.pdf"
    if electivas_pdf.exists():
        pdf_files.append(electivas_pdf)

    if not pdf_files:
        print(f"No PDFs found in {PDF_DIR}")
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDFs to parse")

    all_subjects = []
    for pdf_path in pdf_files:
        # Extract semester number from filename
        match = re.search(r"sem(\d+)", pdf_path.name)
        sem_num = int(match.group(1)) if match else 0

        print(f"\nParsing: {pdf_path.name} (semester {sem_num})...")
        try:
            subjects = parse_pdf_with_claude(client, pdf_path, sem_num)
            event_count = sum(len(s.get("events", [])) for s in subjects)
            print(f"  Extracted {len(subjects)} subjects, {event_count} events")
            all_subjects.extend(subjects)
        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()

    # Build and save JSON
    existing_path = DATA_DIR / "sistemas.json"
    career_json = build_career_json(all_subjects, existing_path)

    with open(existing_path, "w", encoding="utf-8") as f:
        json.dump(career_json, f, ensure_ascii=False, indent=2)

    total_events = sum(len(s["events"]) for s in career_json["subjects"])
    print(f"\nDone! Saved {existing_path.name}")
    print(f"  {len(career_json['subjects'])} subjects, {total_events} total events")


if __name__ == "__main__":
    main()

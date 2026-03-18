import { createEvents, type EventAttributes } from "ics";
import type { Career, AcademicEvent, Turno } from "./types";

function parseDate(date: string, time?: string): [number, number, number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  if (time) {
    const [hour, minute] = time.split(":").map(Number);
    return [year, month, day, hour, minute];
  }
  return [year, month, day, 0, 0];
}

function eventToIcs(event: AcademicEvent): EventAttributes {
  const start = parseDate(event.date, event.startTime);

  if (event.allDay) {
    return {
      title: event.title,
      start: [start[0], start[1], start[2]],
      end: [start[0], start[1], start[2]],
      description: event.notes || undefined,
      status: "CONFIRMED" as const,
      uid: `${event.id}@ortcal.aviera.me`,
    };
  }

  const end = event.endTime
    ? parseDate(event.date, event.endTime)
    : [start[0], start[1], start[2], start[3] + 2, start[4]] as [number, number, number, number, number];

  return {
    title: event.title,
    start,
    startInputType: "local" as const,
    startOutputType: "local" as const,
    end,
    endInputType: "local" as const,
    endOutputType: "local" as const,
    description: event.notes || undefined,
    status: "CONFIRMED" as const,
    uid: `${event.id}@ortcal.aviera.me`,
  };
}

export function generateIcs(career: Career, subjectIds?: string[], turnos?: Turno[]): string {
  const subjects = subjectIds && subjectIds.length > 0
    ? career.subjects.filter((s) => subjectIds.includes(s.id))
    : career.subjects;

  const turnoSet = turnos && turnos.length > 0 ? new Set(turnos) : null;
  const allEvents = subjects
    .flatMap((s) => s.events)
    .filter((e) => {
      if (!turnoSet) return true;
      if (e.turno) return turnoSet.has(e.turno);
      // Infer turno from title/notes for untagged events
      const text = `${e.title} ${e.notes || ""}`.toLowerCase();
      const hasTurnoHint = /\b(mat\.|vesp\.|noct\.|matutino|vespertino|nocturno)/i.test(text);
      if (!hasTurnoHint) return true;
      if (turnoSet.has("matutino") && /\b(mat\.|matutino)/i.test(text)) return true;
      if (turnoSet.has("vespertino") && /\b(vesp\.|vespertino)/i.test(text)) return true;
      if (turnoSet.has("nocturno") && /\b(noct\.|nocturno)/i.test(text)) return true;
      return false;
    });

  if (allEvents.length === 0) {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ORT Calendar//ortcal.aviera.me//ES",
      "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:ORT - " + career.name,
      "X-WR-TIMEZONE:America/Montevideo",
      "END:VCALENDAR",
    ].join("\r\n");
  }

  const icsEvents = allEvents.map(eventToIcs);
  const { value, error } = createEvents(icsEvents, {
    productId: "-//ORT Calendar//ortcal.aviera.me//ES",
    calName: `ORT - ${career.name}`,
  });

  if (error) {
    throw new Error(`Failed to generate ICS: ${error}`);
  }

  // Add timezone header for Google Calendar / Apple Calendar
  const withTimezone = (value || "").replace(
    "BEGIN:VCALENDAR",
    "BEGIN:VCALENDAR\r\nX-WR-TIMEZONE:America/Montevideo"
  );

  return withTimezone;
}

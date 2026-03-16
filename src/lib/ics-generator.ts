import { createEvents, type EventAttributes } from "ics";
import type { Career, AcademicEvent } from "./types";

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
    end,
    description: event.notes || undefined,
    status: "CONFIRMED" as const,
    uid: `${event.id}@ortcal.aviera.me`,
  };
}

export function generateIcs(career: Career, subjectIds?: string[]): string {
  const subjects = subjectIds && subjectIds.length > 0
    ? career.subjects.filter((s) => subjectIds.includes(s.id))
    : career.subjects;

  const allEvents = subjects.flatMap((s) => s.events);

  if (allEvents.length === 0) {
    // Return a valid but empty calendar
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

  return value || "";
}

const BASE_URL = "https://semester-events.vercel.app";

function buildParams(subjectIds?: string[], turnos?: string[]): string {
  const params = new URLSearchParams();
  if (subjectIds && subjectIds.length > 0) {
    params.set("subjects", subjectIds.join(","));
  }
  if (turnos && turnos.length > 0) {
    params.set("turnos", turnos.join(","));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export function getIcsUrl(careerId: string, subjectIds?: string[], turnos?: string[]): string {
  return `${BASE_URL}/api/cal/${careerId}.ics${buildParams(subjectIds, turnos)}`;
}

export function getGoogleCalendarUrl(careerId: string, subjectIds?: string[], turnos?: string[]): string {
  const icsUrl = getIcsUrl(careerId, subjectIds, turnos);
  const webcalUrl = icsUrl.replace("https://", "webcal://");
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
}

export function getWebcalUrl(careerId: string, subjectIds?: string[], turnos?: string[]): string {
  const icsUrl = getIcsUrl(careerId, subjectIds, turnos);
  return icsUrl.replace("https://", "webcal://");
}

export function getDownloadUrl(careerId: string, subjectIds?: string[], turnos?: string[]): string {
  const params = new URLSearchParams();
  if (subjectIds && subjectIds.length > 0) {
    params.set("subjects", subjectIds.join(","));
  }
  if (turnos && turnos.length > 0) {
    params.set("turnos", turnos.join(","));
  }
  params.set("download", "1");
  return `/api/cal/${careerId}.ics?${params.toString()}`;
}

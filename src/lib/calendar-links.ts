const BASE_URL = "https://ortcal.aviera.me";

export function getIcsUrl(careerId: string, subjectIds?: string[]): string {
  const base = `${BASE_URL}/api/cal/${careerId}.ics`;
  if (subjectIds && subjectIds.length > 0) {
    return `${base}?subjects=${subjectIds.join(",")}`;
  }
  return base;
}

export function getGoogleCalendarUrl(careerId: string, subjectIds?: string[]): string {
  const icsUrl = getIcsUrl(careerId, subjectIds);
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsUrl)}`;
}

export function getWebcalUrl(careerId: string, subjectIds?: string[]): string {
  const icsUrl = getIcsUrl(careerId, subjectIds);
  return icsUrl.replace("https://", "webcal://");
}

export function getDownloadUrl(careerId: string, subjectIds?: string[]): string {
  const base = `/api/cal/${careerId}.ics`;
  if (subjectIds && subjectIds.length > 0) {
    return `${base}?subjects=${subjectIds.join(",")}&download=1`;
  }
  return `${base}?download=1`;
}

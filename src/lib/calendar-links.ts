const BASE_URL = "https://semester-events.vercel.app";

export function getIcsUrl(careerId: string, subjectIds?: string[]): string {
  const base = `${BASE_URL}/api/cal/${careerId}.ics`;
  if (subjectIds && subjectIds.length > 0) {
    return `${base}?subjects=${subjectIds.join(",")}`;
  }
  return base;
}

export function getGoogleCalendarUrl(careerId: string, subjectIds?: string[]): string {
  // Google Calendar expects the URL with webcal:// or https:// passed directly to cid
  // without double-encoding. It subscribes to the .ics feed.
  const icsUrl = getIcsUrl(careerId, subjectIds);
  // Use webcal:// protocol which Google handles better for subscriptions
  const webcalUrl = icsUrl.replace("https://", "webcal://");
  return `https://calendar.google.com/calendar/r?cid=${webcalUrl}`;
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

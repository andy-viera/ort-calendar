"use client";

import {
  getGoogleCalendarUrl,
  getWebcalUrl,
  getDownloadUrl,
} from "@/lib/calendar-links";
import { Calendar, Apple, Download } from "lucide-react";

interface ActionBarProps {
  careerId: string;
  selectedSubjects: string[];
}

export function ActionBar({ careerId, selectedSubjects }: ActionBarProps) {
  const hasSelection = selectedSubjects.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <a
        href={hasSelection ? getGoogleCalendarUrl(careerId, selectedSubjects) : "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          hasSelection
            ? "bg-foreground text-background hover:opacity-90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
        onClick={(e) => !hasSelection && e.preventDefault()}
      >
        <Calendar className="w-4 h-4" />
        Agregar a Google Calendar
      </a>
      <a
        href={hasSelection ? getWebcalUrl(careerId, selectedSubjects) : "#"}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          hasSelection
            ? "bg-secondary text-secondary-foreground hover:opacity-90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
        onClick={(e) => !hasSelection && e.preventDefault()}
      >
        <Apple className="w-4 h-4" />
        Apple Calendar
      </a>
      <a
        href={hasSelection ? getDownloadUrl(careerId, selectedSubjects) : "#"}
        download={hasSelection ? `ort-${careerId}.ics` : undefined}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          hasSelection
            ? "bg-secondary text-secondary-foreground hover:opacity-90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
        onClick={(e) => !hasSelection && e.preventDefault()}
      >
        <Download className="w-4 h-4" />
        Descargar .ics
      </a>
    </div>
  );
}

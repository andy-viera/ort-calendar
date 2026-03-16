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
    <div className="flex flex-col gap-2">
      <a
        href={
          hasSelection
            ? getGoogleCalendarUrl(careerId, selectedSubjects)
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          hasSelection
            ? "bg-[#661020] text-white shadow-[0_0_30px_rgba(239,6,61,0.2)] hover:shadow-[0_0_40px_rgba(239,6,61,0.35)] hover:bg-[#7a1426] border border-[#ef063d]/30"
            : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"
        }`}
        onClick={(e) => !hasSelection && e.preventDefault()}
      >
        <Calendar className="w-4 h-4" />
        Agregar a Google Calendar
      </a>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={
            hasSelection
              ? getWebcalUrl(careerId, selectedSubjects)
              : "#"
          }
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            hasSelection
              ? "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white"
              : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-zinc-800/50"
          }`}
          onClick={(e) => !hasSelection && e.preventDefault()}
        >
          <Apple className="w-3.5 h-3.5" />
          Apple
        </a>
        <a
          href={
            hasSelection
              ? getDownloadUrl(careerId, selectedSubjects)
              : "#"
          }
          download={hasSelection ? `ort-${careerId}.ics` : undefined}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            hasSelection
              ? "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white"
              : "bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-zinc-800/50"
          }`}
          onClick={(e) => !hasSelection && e.preventDefault()}
        >
          <Download className="w-3.5 h-3.5" />
          .ics
        </a>
      </div>
    </div>
  );
}

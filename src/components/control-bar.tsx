"use client";

import { useRef } from "react";
import {
  getGoogleCalendarUrl,
  getWebcalUrl,
  getDownloadUrl,
} from "@/lib/calendar-links";
import { Download } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

interface ControlBarProps {
  careerId: string;
  selectedSubjects: string[];
  selectedTurnos?: string[];
}

export function ControlBar({
  careerId,
  selectedSubjects,
  selectedTurnos,
}: ControlBarProps) {
  const hasSelection = selectedSubjects.length > 0;
  const sentinelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={sentinelRef} className="h-0" />

      {/* Floating dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[calc(100%-1.5rem)]">
        {/* Red glow underneath */}
        <div className="absolute -inset-4 rounded-3xl bg-[#ef063d]/[0.06] blur-2xl pointer-events-none" />
        {/* Outer border glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03]" />

        <div className="relative flex items-center gap-1.5 rounded-2xl bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.1] px-2.5 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(239,6,61,0.08)]">
          {/* Google */}
          <a
            href={hasSelection ? getGoogleCalendarUrl(careerId, selectedSubjects, selectedTurnos) : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden ${
              hasSelection
                ? "text-white/90 hover:text-white"
                : "text-white/20 cursor-not-allowed"
            }`}
            onClick={(e) => !hasSelection && e.preventDefault()}
          >
            {hasSelection && <span className="absolute inset-0 rounded-xl bg-white/[0.06] group-hover:bg-[#ef063d]/20 transition-all duration-300" />}
            {hasSelection && <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_12px_rgba(239,6,61,0.15)]" />}
            <GoogleIcon className="w-4 h-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Google</span>
          </a>

          {/* Apple */}
          <a
            href={hasSelection ? getWebcalUrl(careerId, selectedSubjects, selectedTurnos) : "#"}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden ${
              hasSelection
                ? "text-white/90 hover:text-white"
                : "text-white/20 cursor-not-allowed"
            }`}
            onClick={(e) => !hasSelection && e.preventDefault()}
          >
            {hasSelection && <span className="absolute inset-0 rounded-xl bg-white/[0.06] group-hover:bg-[#ef063d]/20 transition-all duration-300" />}
            {hasSelection && <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_12px_rgba(239,6,61,0.15)]" />}
            <AppleIcon className="w-4 h-4 relative z-10" />
            <span className="hidden sm:inline relative z-10">Apple</span>
          </a>

          {/* Download .ics */}
          <a
            href={hasSelection ? getDownloadUrl(careerId, selectedSubjects, selectedTurnos) : "#"}
            download={hasSelection ? `ort-${careerId}.ics` : undefined}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors duration-200 ${
              hasSelection
                ? "text-white/40 hover:text-[#ef063d]"
                : "text-white/15 cursor-not-allowed"
            }`}
            onClick={(e) => !hasSelection && e.preventDefault()}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.ics</span>
          </a>

        </div>
      </div>
    </>
  );
}

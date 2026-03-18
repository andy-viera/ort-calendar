"use client";

import { useState, useMemo, useEffect } from "react";
import type { AcademicEvent, Subject, Turno } from "@/lib/types";
import { EVENT_COLORS, TURNO_LABELS } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  subjects: Subject[];
  selectedSubjects: Set<string>;
  selectedTurnos?: Set<Turno>;
}

export function CalendarView({ subjects, selectedSubjects, selectedTurnos }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const allEvents = useMemo(() => {
    return subjects
      .filter((s) => selectedSubjects.has(s.id))
      .flatMap((s) => s.events.map((e) => ({ ...e, subjectName: s.name })))
      .filter((e) => {
        if (!selectedTurnos || !e.turno) return true;
        return selectedTurnos.has(e.turno);
      });
  }, [subjects, selectedSubjects, selectedTurnos]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  type DayData = {
    day: number;
    events: (AcademicEvent & { subjectName: string })[];
  } | null;
  const days: DayData[] = [];

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      day: d,
      events: allEvents.filter((e) => e.date === dateStr),
    });
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Use state for "today" to avoid SSR/client hydration mismatch
  // (server uses UTC, client uses local timezone → two days highlighted)
  const [todayDate, setTodayDate] = useState<{d: number, m: number, y: number} | null>(null);
  useEffect(() => {
    const now = new Date();
    setTodayDate({ d: now.getDate(), m: now.getMonth(), y: now.getFullYear() });
  }, []);

  const isToday = (d: number) =>
    todayDate !== null &&
    d === todayDate.d &&
    month === todayDate.m &&
    year === todayDate.y;

  const monthEvents = allEvents
    .filter((e) => {
      const [ey, em] = e.date.split("-").map(Number);
      return ey === year && em === month + 1;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-medium tracking-wide">
          {monthNames[month]}{" "}
          <span className="text-muted-foreground">{year}</span>
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7">
          {["LU", "MA", "MI", "JU", "VI", "SA", "DO"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-mono font-semibold text-muted-foreground/50 uppercase tracking-widest py-3 border-b border-border"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((data, i) => (
            <div
              key={i}
              className={`min-h-[5rem] p-1.5 border-b border-r border-border/50 transition-colors ${
                !data
                  ? "bg-muted/30"
                  : data.events.length > 0
                  ? "bg-[#ef063d]/[0.03]"
                  : ""
              }`}
            >
              {data && (
                <>
                  <span
                    className={`text-[11px] font-mono inline-flex items-center justify-center w-6 h-6 rounded-md ${
                      isToday(data.day)
                        ? "bg-[#ef063d] text-white font-bold shadow-[0_0_12px_rgba(239,6,61,0.4)]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {data.day}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {data.events.slice(0, 3).map((event) => {
                      const color = EVENT_COLORS[event.type];
                      return (
                        <div
                          key={event.id}
                          className={`${color.bg} ${color.text} text-[8px] leading-tight px-1 py-[2px] rounded truncate font-medium`}
                          title={`${event.title}${event.startTime ? ` ${event.startTime}` : ""}`}
                        >
                          {event.startTime && <span>{event.startTime} </span>}
                          {event.subjectName.split(" ").slice(0, 2).join(" ")}
                        </div>
                      );
                    })}
                    {data.events.length > 3 && (
                      <div className="text-[8px] text-muted-foreground pl-1">
                        +{data.events.length - 3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event list */}
      {monthEvents.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="text-[10px] font-mono font-semibold text-muted-foreground/50 uppercase tracking-widest">
            {monthNames[month]} {year}
          </div>
          <div className="space-y-0.5">
            {monthEvents.map((event) => {
              const color = EVENT_COLORS[event.type];
              const [, , day] = event.date.split("-");
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <span className="text-sm font-bold font-mono text-muted-foreground group-hover:text-foreground min-w-[1.5rem] text-right transition-colors">
                    {parseInt(day)}
                  </span>
                  <div
                    className={`${color.bg} w-0.5 h-7 rounded-full flex-shrink-0 opacity-80`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {event.allDay
                        ? "Todo el dia"
                        : `${event.startTime} - ${event.endTime}`}
                      {event.turno && ` · ${TURNO_LABELS[event.turno]}`}
                      {event.notes && ` · ${event.notes}`}
                    </p>
                  </div>
                  <span
                    className={`${color.bg} ${color.text} text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0`}
                  >
                    {color.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSubjects.size > 0 && monthEvents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Sin eventos en {monthNames[month].toLowerCase()}
        </p>
      )}

      {selectedSubjects.size === 0 && (
        <div className="text-center py-6 space-y-1">
          <p className="text-muted-foreground text-sm">
            Selecciona tus materias para ver los eventos
          </p>
          <p className="text-muted-foreground/50 text-xs font-mono">
            Usa &quot;Todas&quot; para seleccionar todas
          </p>
        </div>
      )}
    </div>
  );
}

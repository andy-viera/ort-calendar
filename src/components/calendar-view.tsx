"use client";

import { useState, useMemo } from "react";
import type { AcademicEvent, Subject } from "@/lib/types";
import { EVENT_COLORS } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  subjects: Subject[];
  selectedSubjects: Set<string>;
}

export function CalendarView({ subjects, selectedSubjects }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const allEvents = useMemo(() => {
    return subjects
      .filter((s) => selectedSubjects.has(s.id))
      .flatMap((s) => s.events.map((e) => ({ ...e, subjectName: s.name })));
  }, [subjects, selectedSubjects]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  type DayData = { day: number; events: (AcademicEvent & { subjectName: string })[] } | null;
  const days: DayData[] = [];

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ day: d, events: allEvents.filter((e) => e.date === dateStr) });
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

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
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold tracking-tight">
          {monthNames[month]} <span className="text-muted-foreground font-normal">{year}</span>
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-7">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest py-3"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-border">
          {days.map((data, i) => (
            <div
              key={i}
              className={`min-h-[5.5rem] p-1.5 border-b border-r border-border/50 transition-colors ${
                !data ? "bg-muted/20" : data.events.length > 0 ? "bg-muted/30" : ""
              }`}
            >
              {data && (
                <>
                  <span
                    className={`text-xs inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      isToday(data.day)
                        ? "bg-primary text-primary-foreground font-bold"
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
                          className={`${color.bg} ${color.text} text-[9px] leading-tight px-1 py-[2px] rounded-md truncate font-medium`}
                          title={`${event.title}${event.startTime ? ` ${event.startTime}` : ""}`}
                        >
                          {event.startTime && <span>{event.startTime} </span>}
                          {event.subjectName.split(" ").slice(0, 2).join(" ")}
                        </div>
                      );
                    })}
                    {data.events.length > 3 && (
                      <div className="text-[9px] text-muted-foreground pl-1">
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
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Eventos en {monthNames[month]}
          </h3>
          <div className="space-y-1">
            {monthEvents.map((event) => {
              const color = EVENT_COLORS[event.type];
              const [, , day] = event.date.split("-");
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="text-right min-w-[2rem]">
                    <span className="text-sm font-bold tabular-nums text-muted-foreground group-hover:text-foreground transition-colors">
                      {parseInt(day)}
                    </span>
                  </div>
                  <div className={`${color.bg} w-0.5 h-8 rounded-full flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {event.allDay ? "Todo el dia" : `${event.startTime} - ${event.endTime}`}
                      {event.notes && ` · ${event.notes}`}
                    </p>
                  </div>
                  <span
                    className={`${color.bg}/20 text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium`}
                    style={{ color: `var(--tw-${color.bg})` }}
                  >
                    <span className={`${color.bg} ${color.text} px-1.5 py-0.5 rounded-full text-[10px]`}>
                      {color.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSubjects.size > 0 && monthEvents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay eventos en {monthNames[month]}
        </p>
      )}

      {selectedSubjects.size === 0 && (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            Selecciona materias para ver sus eventos
          </p>
          <p className="text-xs text-muted-foreground/50">
            Usa el panel de la izquierda o hacé click en &quot;Todas&quot;
          </p>
        </div>
      )}
    </div>
  );
}

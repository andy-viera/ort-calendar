"use client";

import { useState, useMemo } from "react";
import type { AcademicEvent, Subject } from "@/lib/types";
import { EVENT_COLORS } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  subjects: Subject[];
  selectedSubjects: Set<string>;
}

interface DayEvents {
  date: Date;
  events: (AcademicEvent & { subjectName: string })[];
}

export function CalendarView({ subjects, selectedSubjects }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    // Start at first month that has events, or current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const allEvents = useMemo(() => {
    return subjects
      .filter((s) => selectedSubjects.has(s.id))
      .flatMap((s) =>
        s.events.map((e) => ({ ...e, subjectName: s.name }))
      );
  }, [subjects, selectedSubjects]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = lastDay.getDate();

  const days: (DayEvents | null)[] = [];

  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = allEvents.filter((e) => e.date === dateStr);
    days.push({
      date: new Date(year, month, d),
      events: dayEvents,
    });
  }

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (d: DayEvents) =>
    d.date.getDate() === today.getDate() &&
    d.date.getMonth() === today.getMonth() &&
    d.date.getFullYear() === today.getFullYear();

  // Collect events for list view below calendar
  const monthEvents = allEvents
    .filter((e) => {
      const [ey, em] = e.date.split("-").map(Number);
      return ey === year && em === month + 1;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-accent rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => (
          <div
            key={day}
            className="bg-muted/50 text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`bg-card min-h-[4rem] md:min-h-[5rem] p-1 ${
              !day ? "bg-muted/20" : ""
            } ${day && isToday(day) ? "ring-2 ring-inset ring-foreground/20" : ""}`}
          >
            {day && (
              <>
                <span
                  className={`text-xs ${
                    isToday(day)
                      ? "bg-foreground text-background w-6 h-6 rounded-full inline-flex items-center justify-center font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  {day.date.getDate()}
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {day.events.slice(0, 3).map((event) => {
                    const color = EVENT_COLORS[event.type];
                    return (
                      <div
                        key={event.id}
                        className={`${color.bg} ${color.text} text-[10px] leading-tight px-1 py-0.5 rounded truncate`}
                        title={`${event.title}${event.startTime ? ` ${event.startTime}` : ""}`}
                      >
                        {event.startTime && (
                          <span className="font-medium">{event.startTime} </span>
                        )}
                        {event.subjectName.split(" ").slice(0, 2).join(" ")}
                      </div>
                    );
                  })}
                  {day.events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{day.events.length - 3} más
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Event list for the month */}
      {monthEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Eventos en {monthNames[month]}
          </h3>
          <div className="space-y-1.5">
            {monthEvents.map((event) => {
              const color = EVENT_COLORS[event.type];
              const [, , day] = event.date.split("-");
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="text-right min-w-[2rem]">
                    <span className="text-sm font-semibold">{parseInt(day)}</span>
                  </div>
                  <div
                    className={`${color.bg} w-1 rounded-full self-stretch flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.allDay
                        ? "Todo el día"
                        : `${event.startTime} - ${event.endTime}`}
                      {event.notes && ` · ${event.notes}`}
                    </p>
                  </div>
                  <span
                    className={`${color.bg} ${color.text} text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0`}
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
          No hay eventos en {monthNames[month]}
        </p>
      )}

      {selectedSubjects.size === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Seleccioná materias para ver sus eventos
        </p>
      )}
    </div>
  );
}

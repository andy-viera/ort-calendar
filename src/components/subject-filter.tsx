"use client";

import type { Subject } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

interface SubjectFilterProps {
  subjects: Subject[];
  selected: Set<string>;
  onChange: (subjectId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SubjectFilter({
  subjects,
  selected,
  onChange,
  onSelectAll,
  onDeselectAll,
}: SubjectFilterProps) {
  const bySemester = new Map<number, Subject[]>();
  for (const subject of subjects) {
    const list = bySemester.get(subject.semesterNumber) || [];
    list.push(subject);
    bySemester.set(subject.semesterNumber, list);
  }
  const semesters = Array.from(bySemester.entries()).sort((a, b) => a[0] - b[0]);

  const hasEvents = (s: Subject) => s.events.length > 0;
  const subjectsWithEvents = subjects.filter(hasEvents);

  return (
    <div className="space-y-3 bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Materias
          <span className="ml-2 text-primary">{selected.size}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            Todas
          </button>
          <span className="text-[11px] text-border">|</span>
          <button
            onClick={onDeselectAll}
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            Ninguna
          </button>
        </div>
      </div>

      {subjectsWithEvents.length === 0 && (
        <p className="text-xs text-muted-foreground/60 italic py-2">
          No hay eventos cargados para esta carrera todavia.
        </p>
      )}

      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
        {semesters.map(([semNum, subs]) => {
          const subsWithEvents = subs.filter(hasEvents);
          if (subsWithEvents.length === 0 && subjects.some(hasEvents)) return null;

          return (
            <div key={semNum}>
              <h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1.5">
                Semestre {semNum}
              </h4>
              <div className="space-y-0.5">
                {subs.map((subject) => {
                  const eventCount = subject.events.length;
                  return (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
                        eventCount === 0
                          ? "opacity-25 cursor-default"
                          : selected.has(subject.id)
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={selected.has(subject.id)}
                        onCheckedChange={(checked) =>
                          onChange(subject.id, checked === true)
                        }
                        disabled={eventCount === 0}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-[13px] flex-1 leading-tight">{subject.name}</span>
                      {eventCount > 0 && (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {eventCount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  // Group by semester
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Materias ({selected.size} seleccionadas)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Todas
          </button>
          <span className="text-xs text-muted-foreground">|</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ninguna
          </button>
        </div>
      </div>

      {subjectsWithEvents.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No hay eventos cargados para esta carrera todavía. Los datos se agregarán cuando se procesen los PDFs de Bedelía.
        </p>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {semesters.map(([semNum, subs]) => {
          const subsWithEvents = subs.filter(hasEvents);
          if (subsWithEvents.length === 0 && subjects.some(hasEvents)) return null;

          return (
            <div key={semNum}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Semestre {semNum}
              </h4>
              <div className="space-y-1.5">
                {subs.map((subject) => {
                  const eventCount = subject.events.length;
                  return (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-2.5 py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors ${
                        eventCount === 0 ? "opacity-40" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selected.has(subject.id)}
                        onCheckedChange={(checked) =>
                          onChange(subject.id, checked === true)
                        }
                        disabled={eventCount === 0}
                      />
                      <span className="text-sm flex-1">{subject.name}</span>
                      {eventCount > 0 && (
                        <span className="text-xs text-muted-foreground">
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

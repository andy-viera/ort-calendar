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
  const semesters = Array.from(bySemester.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  const hasEvents = (s: Subject) => s.events.length > 0;
  const subjectsWithEvents = subjects.filter(hasEvents);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Materias
          </span>
          {selected.size > 0 && (
            <span className="text-[11px] font-mono text-[#ef063d] bg-[#661020]/50 px-1.5 py-0.5 rounded">
              {selected.size}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSelectAll}
            className="text-[11px] text-zinc-600 hover:text-[#ef063d] transition-colors"
          >
            Todas
          </button>
          <button
            onClick={onDeselectAll}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Ninguna
          </button>
        </div>
      </div>

      {subjectsWithEvents.length === 0 && (
        <p className="text-[11px] text-zinc-700 py-2">
          Sin eventos cargados aun.
        </p>
      )}

      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {semesters.map(([semNum, subs]) => {
          if (
            subs.every((s) => !hasEvents(s)) &&
            subjects.some(hasEvents)
          )
            return null;

          return (
            <div key={semNum}>
              <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mb-1">
                sem {semNum}
              </div>
              <div className="space-y-px">
                {subs.map((subject) => {
                  const eventCount = subject.events.length;
                  const isSelected = selected.has(subject.id);
                  return (
                    <label
                      key={subject.id}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all ${
                        eventCount === 0
                          ? "opacity-20 cursor-default"
                          : isSelected
                          ? "bg-[#661020]/20 border border-[#ef063d]/20"
                          : "hover:bg-zinc-900/50 border border-transparent"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onChange(subject.id, checked === true)
                        }
                        disabled={eventCount === 0}
                        className="data-[state=checked]:bg-[#ef063d] data-[state=checked]:border-[#ef063d] border-zinc-700"
                      />
                      <span className="text-[13px] text-zinc-300 flex-1 leading-tight">
                        {subject.name}
                      </span>
                      {eventCount > 0 && (
                        <span className="text-[11px] font-mono text-zinc-600">
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

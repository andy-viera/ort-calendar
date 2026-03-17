"use client";

import type { Turno } from "@/lib/types";
import { TURNO_LABELS } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

interface TurnoFilterProps {
  selected: Set<Turno>;
  onChange: (turno: Turno, checked: boolean) => void;
}

const TURNOS: Turno[] = ["matutino", "vespertino", "nocturno"];

const TURNO_ICONS: Record<Turno, string> = {
  matutino: "AM",
  vespertino: "PM",
  nocturno: "NOC",
};

export function TurnoFilter({ selected, onChange }: TurnoFilterProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Turno
      </span>
      <div className="space-y-px">
        {TURNOS.map((turno) => {
          const isSelected = selected.has(turno);
          return (
            <label
              key={turno}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#ef063d]/[0.06] border border-[#ef063d]/15"
                  : "hover:bg-accent border border-transparent"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onChange(turno, checked === true)
                }
                className="data-[state=checked]:bg-[#ef063d] data-[state=checked]:border-[#ef063d]"
              />
              <span className="text-[13px] flex-1 leading-tight">
                {TURNO_LABELS[turno]}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {TURNO_ICONS[turno]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

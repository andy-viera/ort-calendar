"use client";

import type { Turno } from "@/lib/types";
import { TURNO_LABELS } from "@/lib/types";

interface TurnoFilterProps {
  selected: Set<Turno>;
  onChange: (turno: Turno, checked: boolean) => void;
}

const TURNOS: Turno[] = ["matutino", "vespertino", "nocturno"];

const TURNO_SHORT: Record<Turno, string> = {
  matutino: "Mat",
  vespertino: "Vesp",
  nocturno: "Noct",
};

export function TurnoFilter({ selected, onChange }: TurnoFilterProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 font-mono">
        Turno
      </span>
      <div className="flex gap-1.5">
        {TURNOS.map((turno) => {
          const isSelected = selected.has(turno);
          return (
            <button
              key={turno}
              onClick={() => onChange(turno, !isSelected)}
              className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all flex-1 ${
                isSelected
                  ? "bg-[#661020] text-white border border-[#ef063d]/30"
                  : "bg-muted text-muted-foreground/40 border border-border hover:text-muted-foreground"
              }`}
              title={TURNO_LABELS[turno]}
            >
              {TURNO_SHORT[turno]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

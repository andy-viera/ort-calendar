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
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-1">
        Turno
      </span>
      {TURNOS.map((turno) => {
        const isSelected = selected.has(turno);
        return (
          <button
            key={turno}
            onClick={() => onChange(turno, !isSelected)}
            className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              isSelected
                ? "bg-[#661020] text-white border border-[#ef063d]/30"
                : "bg-muted text-muted-foreground/50 border border-border hover:text-muted-foreground"
            }`}
            title={TURNO_LABELS[turno]}
          >
            {TURNO_SHORT[turno]}
          </button>
        );
      })}
    </div>
  );
}

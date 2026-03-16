"use client";

import { CAREER_OPTIONS } from "@/lib/data";

interface CareerSelectorProps {
  selected: string;
  onChange: (careerId: string) => void;
}

export function CareerSelector({ selected, onChange }: CareerSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CAREER_OPTIONS.map((career) => (
        <button
          key={career.id}
          onClick={() => onChange(career.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === career.id
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          {career.name}
        </button>
      ))}
    </div>
  );
}

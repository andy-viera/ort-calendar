"use client";

import { CAREER_OPTIONS } from "@/lib/data";

interface CareerSelectorProps {
  selected: string;
  onChange: (careerId: string) => void;
}

export function CareerSelector({ selected, onChange }: CareerSelectorProps) {
  return (
    <div className="flex gap-1.5 p-1 bg-muted/50 rounded-xl w-fit">
      {CAREER_OPTIONS.map((career) => (
        <button
          key={career.id}
          onClick={() => onChange(career.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === career.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {career.name}
        </button>
      ))}
    </div>
  );
}

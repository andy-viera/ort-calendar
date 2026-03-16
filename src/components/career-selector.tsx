"use client";

import { CAREER_OPTIONS } from "@/lib/data";

interface CareerSelectorProps {
  selected: string;
  onChange: (careerId: string) => void;
}

export function CareerSelector({ selected, onChange }: CareerSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CAREER_OPTIONS.map((career) => (
        <button
          key={career.id}
          onClick={() => onChange(career.id)}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === career.id
              ? "bg-[#661020] text-white shadow-[0_0_20px_rgba(239,6,61,0.3)] border border-[#ef063d]/30"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
          }`}
        >
          {career.name}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState, useCallback, useMemo } from "react";
import { getAllCareers } from "@/lib/data";
import { CareerSelector } from "@/components/career-selector";
import { SubjectFilter } from "@/components/subject-filter";
import { CalendarView } from "@/components/calendar-view";
import { ActionBar } from "@/components/action-bar";
import { Github } from "lucide-react";

export default function Home() {
  const careers = useMemo(() => getAllCareers(), []);
  const [selectedCareer, setSelectedCareer] = useState("sistemas");
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    () => new Set()
  );

  const career = useMemo(
    () => careers.find((c) => c.id === selectedCareer)!,
    [careers, selectedCareer]
  );

  const handleCareerChange = useCallback((careerId: string) => {
    setSelectedCareer(careerId);
    setSelectedSubjects(new Set());
  }, []);

  const handleSubjectChange = useCallback(
    (subjectId: string, checked: boolean) => {
      setSelectedSubjects((prev) => {
        const next = new Set(prev);
        if (checked) next.add(subjectId);
        else next.delete(subjectId);
        return next;
      });
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    setSelectedSubjects(
      new Set(
        career.subjects.filter((s) => s.events.length > 0).map((s) => s.id)
      )
    );
  }, [career]);

  const handleDeselectAll = useCallback(() => {
    setSelectedSubjects(new Set());
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative">
      {/* Subtle warm glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#ef063d]/[0.04] rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative sticky top-0 z-50 backdrop-blur-2xl bg-[#09090b]/80 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">
            <span className="text-[#ef063d]">ORT</span>{" "}
            <span className="text-zinc-200">Calendar</span>
          </h1>
          <a
            href="/about"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Acerca de
          </a>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-5 py-10 space-y-8">
        {/* Hero */}
        <p className="text-zinc-400 text-[15px]">
          Tus parciales y entregas en tu calendario, en un click.
        </p>

        {/* Career selector */}
        <CareerSelector
          selected={selectedCareer}
          onChange={handleCareerChange}
        />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <SubjectFilter
              subjects={career.subjects}
              selected={selectedSubjects}
              onChange={handleSubjectChange}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
            <ActionBar
              careerId={selectedCareer}
              selectedSubjects={Array.from(selectedSubjects)}
            />
          </div>

          <CalendarView
            subjects={career.subjects}
            selectedSubjects={selectedSubjects}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.04] mt-16">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between text-xs text-zinc-600">
          <span>
            by{" "}
            <a
              href="https://github.com/andy-viera"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              andy-viera
            </a>
          </span>
          <a
            href="https://github.com/andy-viera/ort-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-400 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

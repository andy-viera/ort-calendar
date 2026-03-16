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
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ef063d]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative sticky top-0 z-50 backdrop-blur-2xl bg-[#09090b]/70 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-medium tracking-tight">
              <span className="text-[#ef063d] font-bold">ORT</span>{" "}
              <span className="text-zinc-300">Calendar</span>
            </h1>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
              2026-1
            </span>
          </div>
          <a
            href="/about"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Acerca de
          </a>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-5 py-10 space-y-10">
        {/* Hero */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tus parciales y entregas,
            <br />
            <span className="text-zinc-500">en un click.</span>
          </h2>
        </div>

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
      <footer className="relative border-t border-white/[0.04] mt-20">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between text-xs text-zinc-600">
          <span>Open source</span>
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

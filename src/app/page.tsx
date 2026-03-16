"use client";

import { useState, useCallback, useMemo } from "react";
import { getAllCareers, CAREER_OPTIONS } from "@/lib/data";
import { CareerSelector } from "@/components/career-selector";
import { SubjectFilter } from "@/components/subject-filter";
import { CalendarView } from "@/components/calendar-view";
import { ActionBar } from "@/components/action-bar";
import { Github } from "lucide-react";

export default function Home() {
  const careers = useMemo(() => getAllCareers(), []);
  const [selectedCareer, setSelectedCareer] = useState("sistemas");
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(() => new Set());

  const career = useMemo(
    () => careers.find((c) => c.id === selectedCareer)!,
    [careers, selectedCareer]
  );

  const handleCareerChange = useCallback(
    (careerId: string) => {
      setSelectedCareer(careerId);
      setSelectedSubjects(new Set());
    },
    []
  );

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
      new Set(career.subjects.filter((s) => s.events.length > 0).map((s) => s.id))
    );
  }, [career]);

  const handleDeselectAll = useCallback(() => {
    setSelectedSubjects(new Set());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="text-primary">ORT</span> Calendar
            </h1>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              2026-1
            </span>
          </div>
          <a
            href="/about"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Acerca de
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">
            Todos tus parciales y entregas en tu calendario, en un click.
          </p>
        </div>

        {/* Career selector */}
        <CareerSelector selected={selectedCareer} onChange={handleCareerChange} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <SubjectFilter
              subjects={career.subjects}
              selected={selectedSubjects}
              onChange={handleSubjectChange}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            {/* Action bar below subjects */}
            <ActionBar
              careerId={selectedCareer}
              selectedSubjects={Array.from(selectedSubjects)}
            />
          </div>

          {/* Calendar */}
          <CalendarView
            subjects={career.subjects}
            selectedSubjects={selectedSubjects}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Open source</span>
          <a
            href="https://github.com/andy-viera/ort-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

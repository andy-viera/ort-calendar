"use client";

import { useState, useCallback, useMemo } from "react";
import { getAllCareers, CAREER_OPTIONS } from "@/lib/data";
import { CareerSelector } from "@/components/career-selector";
import { SubjectFilter } from "@/components/subject-filter";
import { CalendarView } from "@/components/calendar-view";
import { ActionBar } from "@/components/action-bar";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">ORT Calendar</h1>
            <Badge variant="secondary" className="text-xs">
              1er Sem. 2026
            </Badge>
          </div>
          <a
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Acerca de
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Tagline */}
        <p className="text-muted-foreground text-sm">
          Todos tus parciales y entregas en tu calendario, en un click.
        </p>

        {/* Career selector */}
        <section>
          <CareerSelector selected={selectedCareer} onChange={handleCareerChange} />
        </section>

        {/* Action bar */}
        <section>
          <ActionBar
            careerId={selectedCareer}
            selectedSubjects={Array.from(selectedSubjects)}
          />
        </section>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Subject filter */}
          <aside>
            <SubjectFilter
              subjects={career.subjects}
              selected={selectedSubjects}
              onChange={handleSubjectChange}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />
          </aside>

          {/* Calendar */}
          <section>
            <CalendarView
              subjects={career.subjects}
              selectedSubjects={selectedSubjects}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Open source</span>
          <a
            href="https://github.com/andresvn/ort-calendar"
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

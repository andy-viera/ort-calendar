"use client";

import { useState, useCallback, useMemo } from "react";
import { getAllCareers } from "@/lib/data";
import type { Turno } from "@/lib/types";
import { CareerSelector } from "@/components/career-selector";
import { SubjectFilter } from "@/components/subject-filter";
import { TurnoFilter } from "@/components/turno-filter";
import { CalendarView } from "@/components/calendar-view";
import { ActionBar } from "@/components/action-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github } from "lucide-react";

export default function Home() {
  const careers = useMemo(() => getAllCareers(), []);
  const [selectedCareer, setSelectedCareer] = useState("sistemas");
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedTurnos, setSelectedTurnos] = useState<Set<Turno>>(
    () => new Set(["matutino", "vespertino", "nocturno"])
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

  const handleTurnoChange = useCallback((turno: Turno, checked: boolean) => {
    setSelectedTurnos((prev) => {
      const next = new Set(prev);
      if (checked) next.add(turno);
      else next.delete(turno);
      return next;
    });
  }, []);

  // Check if any events in the current career have turno data
  const hasTurnoData = useMemo(() => {
    return career.subjects.some((s) => s.events.some((e) => e.turno));
  }, [career]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Dot grid bg */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ef063d]/[0.06] dark:bg-[#ef063d]/[0.08] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative sticky top-0 z-50 backdrop-blur-2xl bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">
            <span style={{ color: "#661020" }} className="font-bold">ORT</span>{" "}
            <span className="text-muted-foreground">Calendar</span>
          </h1>
          <div className="flex items-center gap-2">
            <a
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Acerca de
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-5 py-10 space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tus parciales y entregas,
            <br />
            <span className="text-muted-foreground">en un click.</span>
          </h2>
        </div>

        {/* Career selector */}
        <CareerSelector
          selected={selectedCareer}
          onChange={handleCareerChange}
        />

        {/* Action bar + Turno - always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <ActionBar
            careerId={selectedCareer}
            selectedSubjects={Array.from(selectedSubjects)}
          />
          {hasTurnoData && (
            <TurnoFilter
              selected={selectedTurnos}
              onChange={handleTurnoChange}
            />
          )}
        </div>

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
          </div>

          <CalendarView
            subjects={career.subjects}
            selectedSubjects={selectedSubjects}
            selectedTurnos={selectedTurnos}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            by{" "}
            <a
              href="https://github.com/andy-viera"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              andy-viera
            </a>
          </span>
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

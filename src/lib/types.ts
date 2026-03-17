export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  careers: Career[];
}

export interface Career {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  planName?: string;
  code?: string;
  semesterNumber: number;
  events: AcademicEvent[];
}

export type EventType =
  | "parcial"
  | "parcial_2da"
  | "entrega_obl"
  | "entrega_obl_2da"
  | "planteo_obl"
  | "entrega_ejercicios"
  | "consulta"
  | "cierre_curso";

export type Turno = "matutino" | "vespertino" | "nocturno";

export interface AcademicEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  turno?: Turno;
  notes?: string;
  source: "bedelia_pdf" | "aulas_manual";
}

export const TURNO_LABELS: Record<Turno, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  nocturno: "Nocturno",
};

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; label: string }> = {
  parcial: { bg: "bg-[#ef063d]", text: "text-white", label: "Parcial" },
  parcial_2da: { bg: "bg-amber-600", text: "text-white", label: "2da Inst. Parcial" },
  entrega_obl: { bg: "bg-indigo-500", text: "text-white", label: "Entrega OBL" },
  entrega_obl_2da: { bg: "bg-indigo-400", text: "text-white", label: "2da Inst. Entrega" },
  planteo_obl: { bg: "bg-cyan-600", text: "text-white", label: "Planteo OBL" },
  entrega_ejercicios: { bg: "bg-violet-500", text: "text-white", label: "Entrega Ejercicios" },
  consulta: { bg: "bg-zinc-600", text: "text-white", label: "Consulta" },
  cierre_curso: { bg: "bg-zinc-700", text: "text-zinc-300", label: "Cierre" },
};

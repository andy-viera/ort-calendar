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

export interface AcademicEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  notes?: string;
  source: "bedelia_pdf" | "aulas_manual";
}

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; label: string }> = {
  parcial: { bg: "bg-red-500", text: "text-white", label: "Parcial" },
  parcial_2da: { bg: "bg-orange-500", text: "text-white", label: "2da Inst. Parcial" },
  entrega_obl: { bg: "bg-blue-500", text: "text-white", label: "Entrega OBL" },
  entrega_obl_2da: { bg: "bg-sky-400", text: "text-white", label: "2da Inst. Entrega" },
  planteo_obl: { bg: "bg-green-500", text: "text-white", label: "Planteo OBL" },
  entrega_ejercicios: { bg: "bg-purple-500", text: "text-white", label: "Entrega Ejercicios" },
  consulta: { bg: "bg-gray-400", text: "text-white", label: "Consulta" },
  cierre_curso: { bg: "bg-gray-600", text: "text-white", label: "Cierre" },
};

import type { Semester, Career } from "./types";

import sistemasData from "../data/semesters/2026-1/sistemas.json";
import electricaData from "../data/semesters/2026-1/electrica.json";
import biotecnologiaData from "../data/semesters/2026-1/biotecnologia.json";
import electronicaData from "../data/semesters/2026-1/electronica.json";

const careers: Record<string, Career> = {
  sistemas: sistemasData as unknown as Career,
  electrica: electricaData as unknown as Career,
  biotecnologia: biotecnologiaData as unknown as Career,
  electronica: electronicaData as unknown as Career,
};

export function getSemester(): Semester {
  return {
    id: "2026-1",
    name: "1er Semestre 2026",
    startDate: "2026-03-09",
    endDate: "2026-08-15",
    careers: Object.values(careers),
  };
}

export function getCareer(id: string): Career | undefined {
  return careers[id];
}

export function getAllCareers(): Career[] {
  return Object.values(careers);
}

export const CAREER_OPTIONS = [
  { id: "sistemas", name: "Ing. en Sistemas" },
  { id: "electrica", name: "Ing. Eléctrica" },
  { id: "biotecnologia", name: "Ing. en Biotecnología" },
  { id: "electronica", name: "Ing. en Electrónica" },
] as const;

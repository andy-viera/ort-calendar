import { NextRequest, NextResponse } from "next/server";
import { getCareer } from "@/lib/data";
import { generateIcs } from "@/lib/ics-generator";
import type { Turno } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ career: string }> }
) {
  const { career: careerParam } = await params;
  // Strip .ics extension if present
  const careerId = careerParam.replace(/\.ics$/, "");
  const career = getCareer(careerId);

  if (!career) {
    return NextResponse.json({ error: "Career not found" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const subjectsParam = searchParams.get("subjects");
  const subjectIds = subjectsParam ? subjectsParam.split(",").filter(Boolean) : undefined;
  const turnosParam = searchParams.get("turnos");
  const turnos = turnosParam ? turnosParam.split(",").filter(Boolean) as Turno[] : undefined;
  const isDownload = searchParams.get("download") === "1";

  const icsContent = generateIcs(career, subjectIds, turnos);

  const headers: Record<string, string> = {
    "Content-Type": "text/calendar; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  };

  if (isDownload) {
    headers["Content-Disposition"] = `attachment; filename="ort-${careerId}.ics"`;
  }

  return new NextResponse(icsContent, { headers });
}

import { Badge } from "@/components/ui/badge";
import { Github, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">ORT Calendar</h1>
          <Badge variant="secondary" className="text-xs">
            1er Sem. 2026
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold">Acerca de</h2>

        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">ORT Calendar</strong> es una herramienta gratuita y
            open source para estudiantes de ingeniería de la Universidad ORT Uruguay.
          </p>

          <p>
            Recopila automáticamente todas las fechas de parciales, entregas de obligatorios, y
            segundas instancias de los PDFs oficiales de Bedelía, y te permite suscribirte a un
            calendario filtrado por tus materias.
          </p>

          <h3 className="text-foreground font-semibold text-base pt-2">
            ¿Cómo funciona?
          </h3>

          <ol className="list-decimal list-inside space-y-1.5">
            <li>Seleccioná tu carrera</li>
            <li>Marcá las materias que estás cursando</li>
            <li>
              Hacé click en &quot;Agregar a Google Calendar&quot; — Google te pregunta &quot;¿Agregar
              este calendario?&quot; → Sí → listo
            </li>
            <li>
              Si usás Apple Calendar, hacé click en &quot;Apple Calendar&quot; y se suscribe
              automáticamente
            </li>
          </ol>

          <p>
            El calendario se actualiza automáticamente. Si una fecha cambia durante el semestre,
            se refleja en tu calendario sin que tengas que hacer nada.
          </p>

          <h3 className="text-foreground font-semibold text-base pt-2">
            Datos
          </h3>

          <p>
            Los datos provienen de los PDFs de calendarios académicos publicados por la Bedelía de
            la Escuela de Ingeniería. No se requiere login ni acceso a Aulas para usar la herramienta.
          </p>

          <p>
            Los calendarios están sujetos a cambios por parte de la universidad. Esta herramienta
            los refleja lo más fielmente posible, pero siempre verificá con las fuentes oficiales.
          </p>

          <h3 className="text-foreground font-semibold text-base pt-2">
            Contribuir
          </h3>

          <p>
            El código es open source. Si querés contribuir, reportar un error, o agregar datos de
            otras carreras, visitá el repositorio en GitHub.
          </p>
        </div>

        <a
          href="https://github.com/andresvn/ort-calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:text-foreground transition-colors text-muted-foreground"
        >
          <Github className="w-4 h-4" />
          github.com/andresvn/ort-calendar
        </a>
      </main>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novedades" };

/** Prioridad baja (fase 3): portal de novedades con publicaciones de Instagram/Facebook e inscripción a catas. */
export default function Novedades() {
  return (
    <section className="seccion">
      <div className="contenedor pila" style={{ gap: 16, maxWidth: 720 }}>
        <span className="eyebrow">Novedades</span>
        <h1>Eventos, catas y noticias</h1>
        <p className="suave">Muy pronto: el canal de novedades de Latitud Cero, con inscripción a catas y avisos por email y WhatsApp.</p>
      </div>
    </section>
  );
}

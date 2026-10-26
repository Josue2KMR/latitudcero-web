"use client";
import { useRef, useState } from "react";

/** Pestañas accesibles (patrón WAI-ARIA): flechas para moverse, solo la activa entra en el Tab. */
export function PestanasFicha({ pestanas }: { pestanas: { id: string; titulo: string; contenido: React.ReactNode }[] }) {
  const [activa, setActiva] = useState(pestanas[0].id);
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});

  function teclado(e: React.KeyboardEvent) {
    const i = pestanas.findIndex((p) => p.id === activa);
    const sig = e.key === "ArrowRight" ? (i + 1) % pestanas.length : e.key === "ArrowLeft" ? (i - 1 + pestanas.length) % pestanas.length : -1;
    if (sig < 0) return;
    e.preventDefault();
    setActiva(pestanas[sig].id);
    botones.current[pestanas[sig].id]?.focus();
  }

  return (
    <div>
      <div className="pestanas" role="tablist" aria-label="Información del café" onKeyDown={teclado}>
        {pestanas.map((p) => (
          <button key={p.id} ref={(el) => { botones.current[p.id] = el; }} role="tab" id={`tab-${p.id}`} aria-controls={`panel-${p.id}`}
            aria-selected={p.id === activa} tabIndex={p.id === activa ? 0 : -1} onClick={() => setActiva(p.id)}>
            {p.titulo}
          </button>
        ))}
      </div>
      {pestanas.map((p) => (
        <div key={p.id} className="panel-pestana" role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} tabIndex={0} hidden={p.id !== activa}>
          {p.contenido}
        </div>
      ))}
    </div>
  );
}

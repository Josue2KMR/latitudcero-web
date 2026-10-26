"use client";
import { useRef } from "react";
import { ECUADOR_PATH, MAPA } from "@/domain/ecuador-path";
import { desproyectar, proyectar } from "@/domain/mapa";
import type { Finca } from "@/domain/types";

/**
 * Mapa de Ecuador continental con la línea del ecuador y un punto por cada finca.
 * Con `alElegir`, el mapa se vuelve editable: un clic devuelve la latitud y longitud de ese punto
 * (lo usa el panel para marcar la hacienda sin tener que buscar coordenadas).
 */
interface Props {
  fincas: Finca[];
  alElegir?: (punto: { lat: number; lng: number }) => void;
  leyenda?: string;
}

export function MapaOrigen({ fincas, alElegir, leyenda }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const ecuadorY = MAPA.ty.toFixed(1);

  function clic(e: React.MouseEvent<SVGSVGElement>) {
    if (!alElegir || !svg.current) return;
    const p = svg.current.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const local = p.matrixTransform(svg.current.getScreenCTM()!.inverse());
    alElegir(desproyectar(local.x, local.y));
  }

  const descripcion = fincas.length
    ? `Mapa de Ecuador con ${fincas.length === 1 ? "la finca" : "las fincas"} ${fincas.map((f) => f.nombre).join(", ")}`
    : "Mapa de Ecuador continental con la línea del ecuador";

  return (
    <figure className="mapa" data-editable={!!alElegir}>
      <svg ref={svg} viewBox={`0 0 ${MAPA.ancho} ${MAPA.alto}`} role="img" aria-label={descripcion} onClick={clic}>
        <path d={ECUADOR_PATH} fill="var(--secundario-100)" stroke="var(--secundario-700)" strokeWidth="1.2" />
        <line x1="0" x2={MAPA.ancho} y1={ecuadorY} y2={ecuadorY} stroke="var(--acento-700)" strokeWidth="1.5" strokeDasharray="6 5" />
        <text x="8" y={MAPA.ty - 8} fontFamily="var(--f-dato)" fontSize="11" fill="var(--acento-700)">Latitud 0°</text>
        {fincas.map((f, i) => {
          const { x, y } = proyectar(f.lat, f.lng);
          // ~6,4 unidades por letra a 11px: el nombre va del lado donde entra entero; si no entra, se acorta.
          const ancho = (s: string) => s.length * 6.4;
          const entraDerecha = x + 12 + ancho(f.nombre) <= MAPA.ancho;
          const entraIzquierda = x - 12 - ancho(f.nombre) >= 0;
          const derecha = entraDerecha || (!entraIzquierda && x < MAPA.ancho / 2);
          const espacio = derecha ? MAPA.ancho - x - 16 : x - 16;
          const maxLetras = Math.floor(espacio / 6.4);
          const texto = f.nombre.length > maxLetras ? f.nombre.slice(0, Math.max(3, maxLetras - 1)) + "…" : f.nombre;
          return (
            <g key={`${f.nombre}-${i}`}>
              <circle cx={x} cy={y} r="10" fill="var(--primario-500)" opacity="0.18" />
              <circle cx={x} cy={y} r="5" fill="var(--primario-500)" />
              <text x={derecha ? x + 12 : x - 12} y={y + 4} textAnchor={derecha ? "start" : "end"} fontSize="11" fontWeight="600" fill="var(--n-900)" stroke="var(--n-0)" strokeWidth="3" paintOrder="stroke">
                {texto}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>{leyenda ?? (fincas.length ? fincas.map((f) => f.nombre).join(" · ") : "La finca se marca cuando el tostador carga su ubicación.")}</figcaption>
    </figure>
  );
}

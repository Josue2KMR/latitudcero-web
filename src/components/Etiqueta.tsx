import { pesoEtiqueta } from "@/domain/cafe";
import type { FichaEditable, Tueste } from "@/domain/types";

/**
 * Réplica de la etiqueta impresa, generada con los datos de la ficha.
 * Grilla de 3 columnas como el original: [rombos | rombos | SCA] / [NOMBRE] / [notas | notas | tueste] / [variedad | altitud | peso].
 * El origen ya es el nombre grande, por eso no se repite en otra celda.
 */
interface Props {
  nombre: string;
  ficha: Pick<FichaEditable, "sca" | "notas" | "tueste" | "variedad" | "altitud">;
  pesoGramos: number;
}

export function Rombos() {
  return (
    <svg width="132" height="40" viewBox="0 0 132 40" aria-hidden="true">
      {["var(--rombo-naranja)", "var(--rombo-azul)", "var(--rombo-rojo)"].map((c, i) => (
        <g key={i} transform={`translate(${6 + i * 44},2)`} fill="none" stroke={c} strokeWidth="3">
          <path d="M18 2 34 18 18 34 2 18Z" /><path d="M18 10 26 18 18 26 10 18Z" /><circle cx="18" cy="18" r="2" fill={c} />
        </g>
      ))}
    </svg>
  );
}

export function PuntosTueste({ tueste }: { tueste: Tueste }) {
  return (
    <span className="puntos" role="img" aria-label={`Tueste ${tueste} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} data-on={i === tueste} />)}
    </span>
  );
}

export function Etiqueta({ nombre, ficha, pesoGramos }: Props) {
  const resumen = `Etiqueta de ${nombre}: puntaje SCA ${ficha.sca ?? "pendiente"}, notas ${ficha.notas.join(", ") || "sin cargar"}, tueste ${ficha.tueste} de 5`;
  return (
    <div className="estampilla" role="img" aria-label={resumen}>
      <div className="etiqueta" aria-hidden="true">
        <div className="rombos"><Rombos /></div>
        <div className="cabecera"><span>SCA:</span><span className="num">{ficha.sca ?? "—"}</span></div>
        <div className="nombre">{nombre || "Nombre"}</div>
        <div className="notas"><span className="k">Notas:</span><span className="v">{ficha.notas.length ? ficha.notas.join(", ") + "." : "—"}</span></div>
        <div><span className="k">Tueste:</span><PuntosTueste tueste={ficha.tueste} /></div>
        <div><span className="k">Variedad:</span><span className="v">{ficha.variedad || "—"}</span></div>
        <div><span className="k">Altitud:</span><span className="v">{ficha.altitud ? `${ficha.altitud} m` : "—"}</span></div>
        <div><span className="k">Peso neto:</span><span className="v peso">{pesoEtiqueta(pesoGramos)}</span></div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { categoriaSca, formatoPesos, TUESTES } from "@/domain/cafe";
import type { Cafe } from "@/domain/types";
import { IconoFinca, IconoGota, IconoHoja, IconoLlama, IconoMontana, IconoPin } from "./Iconos";

export function Sca({ cafe }: { cafe: Pick<Cafe, "sca" | "scaFuente"> }) {
  if (cafe.sca == null) return <span className="chip">SCA pendiente</span>;
  return (
    <div className="sca" title="Puntaje de cata de la Specialty Coffee Association, escala de 0 a 100. 80 o más es café de especialidad.">
      <span className="valor">{cafe.sca}</span>
      <span className="detalle">Puntos SCA<br />{categoriaSca(cafe.sca)}</span>
    </div>
  );
}

export function DatosOrigen({ cafe }: { cafe: Cafe }) {
  const filas: [React.ReactNode, string, string][] = [
    [<IconoPin key="p" />, "Origen", [cafe.region, cafe.pais].filter(Boolean).join(", ")],
    [<IconoMontana key="m" />, "Altitud", cafe.altitud ? `${cafe.altitud} m s.n.m.` : ""],
    [<IconoHoja key="h" />, "Variedad", cafe.variedad],
    [<IconoGota key="g" />, "Proceso", cafe.proceso],
    [<IconoFinca key="f" />, "Productor o finca", cafe.productor || cafe.fincas.map((f) => f.nombre).join(", ")],
    [<IconoLlama key="l" />, "Tueste", TUESTES[cafe.tueste]],
  ];
  return (
    <div className="datos-origen">
      {filas.map(([icono, k, v]) => (
        <div className="dato-origen" key={k}>
          {icono}
          <div><small>{k}</small>{v ? <strong>{v}</strong> : <span className="suave">No informado</span>}</div>
        </div>
      ))}
    </div>
  );
}

export function PerfilTaza({ cafe }: { cafe: Cafe }) {
  const p = cafe.perfil;
  if (!p) return <div className="vacio">El perfil de taza lo completa el tostador desde el panel.</div>;
  const filas: [string, number][] = [["Acidez", p.acidez], ["Dulzor", p.dulzor], ["Cuerpo", p.cuerpo], ["Amargor", p.amargor]];
  return (
    <div className="perfil">
      {p.esEjemplo && <span className="chip aviso" style={{ justifySelf: "start" }}>Valores de ejemplo</span>}
      {filas.map(([k, v]) => (
        <div className="barra" key={k}>
          <span>{k}</span>
          <div className="pista" role="meter" aria-label={k} aria-valuemin={0} aria-valuemax={5} aria-valuenow={v}><i style={{ width: `${(v / 5) * 100}%` }} /></div>
          <span className="dato">{v}/5</span>
        </div>
      ))}
      {cafe.notas.length > 0 && <div className="fila">{cafe.notas.map((n) => <span className="chip" key={n}>{n}</span>)}</div>}
      {cafe.preparacion.length > 0 && <p className="suave">Recomendado para: {cafe.preparacion.join(" · ")}</p>}
    </div>
  );
}

export function TarjetaCafe({ cafe }: { cafe: Cafe }) {
  const conPrecio = cafe.variantes.filter((v) => v.precio > 0);
  const desde = conPrecio.length ? Math.min(...conPrecio.map((v) => v.precio)) : null;
  const hayStock = cafe.variantes.some((v) => v.disponible > 0);
  return (
    <article className="tarjeta">
      <div className="foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cafe.imagen && <img src={cafe.imagen} alt="" loading="lazy" />}
        {cafe.sca != null && <span className="sca-pastilla">SCA {cafe.sca}</span>}
      </div>
      <div className="cuerpo">
        <span className="eyebrow">{[cafe.pais, cafe.altitud ? `${cafe.altitud} m` : "", cafe.variedad].filter(Boolean).join(" · ")}</span>
        <h3><Link href={`/cafe/${cafe.slug}`}>{cafe.nombre}</Link></h3>
        <p className="suave">{cafe.notas.slice(0, 3).join(", ")}</p>
        <div className="fila">
          <span className="precio">{desde ? `desde ${formatoPesos(desde)}` : ""}</span>
          <span className="crece" />
          <span className={`chip ${hayStock ? "ok" : "error"}`}>{hayStock ? "En stock" : "Agotado"}</span>
        </div>
      </div>
    </article>
  );
}

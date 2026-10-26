"use client";
import { useState, useTransition } from "react";
import { guardarFicha } from "@/app/acciones";
import type { Cafe, FichaEditable, Finca, PerfilTaza, Tueste } from "@/domain/types";
import { Etiqueta } from "./Etiqueta";
import { MapaOrigen } from "./MapaOrigen";
import { TuesteSelector } from "./TuesteSelector";

/**
 * Editor de la ficha del café con vista previa en vivo de la etiqueta y del mapa.
 * Para marcar una hacienda: escribís el nombre, hacés clic en el mapa y queda el punto.
 */
export function EditorFicha({ cafe }: { cafe: Cafe }) {
  const [f, setF] = useState<FichaEditable>(() => ({
    sca: cafe.sca, scaFuente: cafe.scaFuente, pais: cafe.pais, region: cafe.region, productor: cafe.productor,
    fincas: cafe.fincas, variedad: cafe.variedad, altitud: cafe.altitud, proceso: cafe.proceso, tueste: cafe.tueste,
    notas: cafe.notas, preparacion: cafe.preparacion, perfil: cafe.perfil,
  }));
  const [nuevaFinca, setNuevaFinca] = useState("");
  const [peso, setPeso] = useState(cafe.variantes[0]?.pesoGramos ?? 250);
  const [aviso, setAviso] = useState<{ ok?: string; error?: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const set = <K extends keyof FichaEditable>(k: K, v: FichaEditable[K]) => setF((x) => ({ ...x, [k]: v }));
  const num = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));
  const lista = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const perfil: PerfilTaza = f.perfil ?? { acidez: 0, dulzor: 0, cuerpo: 0, amargor: 0, esEjemplo: false };

  function marcarFinca(p: { lat: number; lng: number }) {
    if (!nuevaFinca.trim()) {
      setAviso({ error: "Escribí el nombre de la finca o hacienda antes de marcarla en el mapa." });
      return;
    }
    const finca: Finca = { nombre: nuevaFinca.trim(), ...p };
    set("fincas", [...f.fincas, finca]);
    setNuevaFinca("");
    setAviso({ ok: `${finca.nombre} marcada en ${p.lat}, ${p.lng}. Guardá para publicarla.` });
  }

  return (
    <div className="editor">
      <form className="pila" onSubmit={(e) => { e.preventDefault(); iniciar(async () => setAviso(await guardarFicha(cafe.id, cafe.slug, f))); }}>
        <fieldset>
          <legend>Puntaje SCA</legend>
          <div className="dos-col">
            <div className="campo"><label htmlFor="sca">Puntaje (0 a 100)</label>
              <input id="sca" inputMode="decimal" value={f.sca ?? ""} onChange={(e) => set("sca", num(e.target.value))} /></div>
            <div className="campo"><label htmlFor="scaf">Quién lo cató</label>
              <input id="scaf" value={f.scaFuente} placeholder="Q Grader del exportador" onChange={(e) => set("scaFuente", e.target.value)} /></div>
          </div>
        </fieldset>

        <TuesteSelector valor={f.tueste} alCambiar={(t: Tueste) => set("tueste", t)} />

        <fieldset>
          <legend>Origen</legend>
          <div className="dos-col">
            <div className="campo"><label htmlFor="pais">País</label><input id="pais" value={f.pais} onChange={(e) => set("pais", e.target.value)} /></div>
            <div className="campo"><label htmlFor="region">Provincia o región</label><input id="region" value={f.region} onChange={(e) => set("region", e.target.value)} /></div>
            <div className="campo"><label htmlFor="prod">Productor</label><input id="prod" value={f.productor} onChange={(e) => set("productor", e.target.value)} /></div>
            <div className="campo"><label htmlFor="alt">Altitud (m s.n.m.)</label><input id="alt" inputMode="numeric" value={f.altitud ?? ""} onChange={(e) => set("altitud", num(e.target.value))} /></div>
            <div className="campo"><label htmlFor="var">Variedad</label><input id="var" value={f.variedad} onChange={(e) => set("variedad", e.target.value)} /></div>
            <div className="campo"><label htmlFor="proc">Proceso</label>
              <select id="proc" value={f.proceso} onChange={(e) => set("proceso", e.target.value)}>
                {["", "Lavado", "Natural", "Honey", "Otro"].map((p) => <option key={p} value={p}>{p || "No informado"}</option>)}
              </select></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Fincas en el mapa</legend>
          <div className="campo"><label htmlFor="finca">Nombre de la finca o hacienda</label>
            <input id="finca" value={nuevaFinca} placeholder="Hacienda La Esperanza" onChange={(e) => setNuevaFinca(e.target.value)} />
            <span className="ayuda">Después hacé clic en el mapa de la derecha donde está la finca.</span></div>
          {f.fincas.length > 0 && (
            <ul className="pila" style={{ gap: 6, margin: 0, paddingLeft: 18 }}>
              {f.fincas.map((x, i) => (
                <li key={i} className="fila"><span className="crece">{x.nombre} <span className="suave dato">({x.lat}, {x.lng})</span></span>
                  <button type="button" className="enlace" onClick={() => set("fincas", f.fincas.filter((_, j) => j !== i))}>Quitar</button></li>
              ))}
            </ul>
          )}
        </fieldset>

        <fieldset>
          <legend>Taza</legend>
          <div className="campo"><label htmlFor="notas">Notas de cata (separadas por coma)</label>
            <input id="notas" value={f.notas.join(", ")} onChange={(e) => set("notas", lista(e.target.value))} /></div>
          {(["acidez", "dulzor", "cuerpo", "amargor"] as const).map((k) => (
            <div className="campo" key={k}>
              <label htmlFor={`p-${k}`}>{k[0].toUpperCase() + k.slice(1)}: <span className="dato">{perfil[k]}/5</span></label>
              <input id={`p-${k}`} type="range" min={0} max={5} step={1} value={perfil[k]}
                onChange={(e) => set("perfil", { ...perfil, [k]: Number(e.target.value), esEjemplo: false })} />
            </div>
          ))}
          <div className="campo"><label htmlFor="prep">Recomendado para (separado por coma)</label>
            <input id="prep" value={f.preparacion.join(", ")} onChange={(e) => set("preparacion", lista(e.target.value))} /></div>
        </fieldset>

        <div role="status" aria-live="polite">
          {aviso?.error && <div className="aviso error">{aviso.error}</div>}
          {aviso?.ok && <div className="aviso ok">{aviso.ok}</div>}
        </div>
        <div><button className="boton" disabled={guardando}>{guardando ? "Guardando…" : "Guardar ficha y etiqueta"}</button></div>
      </form>

      <div className="vista">
        <span className="eyebrow">Vista previa de la etiqueta</span>
        <div className="opciones" role="group" aria-label="Peso de la vista previa">
          {cafe.variantes.map((v) => (
            <button key={v.id} type="button" className="opcion" style={{ minWidth: 0, minHeight: 40, padding: "6px 14px" }} aria-pressed={peso === v.pesoGramos} onClick={() => setPeso(v.pesoGramos)}>
              {v.pesoGramos >= 1000 ? `${v.pesoGramos / 1000} kg` : `${v.pesoGramos} g`}
            </button>
          ))}
        </div>
        <Etiqueta nombre={cafe.nombre} ficha={f} pesoGramos={peso} />
        <MapaOrigen fincas={f.fincas} alElegir={marcarFinca} leyenda="Hacé clic para marcar la finca que escribiste." />
      </div>
    </div>
  );
}

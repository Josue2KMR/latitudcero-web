"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { agregarAlCarrito } from "@/app/acciones";
import { formatoPesos, pesoCorto } from "@/domain/cafe";
import type { Molienda, Variante } from "@/domain/types";

/** Tres decisiones en orden: presentación, molienda, cantidad. Nada más (ley de Hick). */
export function ComprarCafe({ variantes, moliendas }: { variantes: Variante[]; moliendas: Molienda[] }) {
  const [varianteId, setVarianteId] = useState(() => (variantes.find((v) => v.disponible > 0) ?? variantes[0])?.id);
  const [cantidad, setCantidad] = useState(1);
  // Controlado: React 19 resetea los campos no controlados del form después de cada acción.
  const [moliendaId, setMoliendaId] = useState("");
  const [estado, accion, enviando] = useActionState(agregarAlCarrito, null);
  const v = variantes.find((x) => x.id === varianteId);
  const sinStock = !v || v.disponible <= 0;

  return (
    <form action={accion} className="pila" style={{ gap: 22 }} noValidate>
      <div className="precio" style={{ fontSize: "1.6rem" }} aria-live="polite">{v ? formatoPesos(v.precio) : "—"}</div>
      <input type="hidden" name="varianteId" value={varianteId ?? ""} />

      <div className="pila" style={{ gap: 8 }}>
        <span className="rotulo" id="r-pres">Presentación</span>
        <div className="opciones" role="group" aria-labelledby="r-pres">
          {variantes.map((x) => (
            <button key={x.id} type="button" className="opcion" aria-pressed={x.id === varianteId} disabled={x.disponible <= 0} onClick={() => setVarianteId(x.id)}>
              <b>{pesoCorto(x.pesoGramos)}</b>
              <small>{formatoPesos(x.precio)} · {x.disponible <= 0 ? "agotado" : x.disponible <= 5 ? `quedan ${x.disponible}` : "en stock"}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="campo" style={{ maxWidth: 440 }}>
        <label htmlFor="molienda">Molienda</label>
        <select id="molienda" name="moliendaId" value={moliendaId} onChange={(e) => setMoliendaId(e.target.value)} aria-describedby="molienda-ayuda">
          <option value="" disabled>Elegí según tu cafetera</option>
          {moliendas.map((m) => <option key={m.id} value={m.id}>{m.nombre} — {m.metodo}</option>)}
        </select>
        <span className="ayuda" id="molienda-ayuda">Molemos al preparar tu pedido. Podés cambiarla después en el carrito.</span>
      </div>

      <div className="fila">
        <span className="rotulo" id="r-cant">Cantidad</span>
        <div className="cantidad" role="group" aria-labelledby="r-cant">
          <button type="button" aria-label="Restar uno" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
          <input name="cantidad" inputMode="numeric" aria-label="Cantidad" value={cantidad} onChange={(e) => setCantidad(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
          <button type="button" aria-label="Sumar uno" onClick={() => setCantidad((c) => Math.min(20, c + 1))}>+</button>
        </div>
      </div>

      <div role="status">
        {estado?.error && <div className="aviso error">{estado.error}</div>}
        {estado?.ok && <div className="aviso ok fila"><span className="crece">{estado.ok}</span><Link className="boton chico" href="/carrito">Ver carrito</Link></div>}
      </div>

      <div><button className="boton" disabled={sinStock || enviando}>{enviando ? "Agregando…" : sinStock ? "Agotado" : "Agregar al carrito"}</button></div>
    </form>
  );
}

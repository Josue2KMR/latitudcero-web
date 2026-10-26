"use client";
import { useState, useTransition } from "react";
import { actualizarLinea, quitarLinea } from "@/app/acciones";
import { formatoPesos, pesoCorto } from "@/domain/cafe";
import type { LineaCarritoDetalle, Molienda } from "@/domain/types";

/**
 * Una fila del carrito editable: cantidad y molienda se cambian sin salir de la página.
 * Mientras el servidor responde, la fila se marca aria-busy y los controles quedan quietos,
 * así un doble clic no manda dos cambios.
 */
export function LineaCarrito({ linea, moliendas }: { linea: LineaCarritoDetalle; moliendas: Molienda[] }) {
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<{ ok?: string; error?: string } | null>(null);
  const correr = (fn: () => Promise<{ ok?: string; error?: string } | null>) => iniciar(async () => setAviso(await fn()));
  const sinOpcion = !moliendas.some((m) => m.id === linea.molienda.id);

  return (
    <div className="linea" aria-busy={pendiente}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={linea.cafe.imagen} alt="" />
      <div className="pila" style={{ gap: 4 }}>
        <strong>{linea.cafe.nombre} · {pesoCorto(linea.variante.pesoGramos)}</strong>
        <span className="suave dato" style={{ fontSize: ".82rem" }}>{linea.variante.sku}</span>
        <div className="controles">
          <div className="campo" style={{ gap: 4 }}>
            <label htmlFor={`mol-${linea.id}`} style={{ fontSize: ".85rem" }}>Molienda</label>
            <select id={`mol-${linea.id}`} value={linea.molienda.id} disabled={pendiente}
              onChange={(e) => correr(() => actualizarLinea(linea.id, { moliendaId: e.target.value }))}>
              {sinOpcion && <option value={linea.molienda.id}>{linea.molienda.nombre}</option>}
              {moliendas.map((m) => <option key={m.id} value={m.id}>{m.nombre} — {m.metodo}</option>)}
            </select>
          </div>
          <div className="campo" style={{ gap: 4 }}>
            <span style={{ fontSize: ".85rem", fontWeight: 600 }} id={`cant-${linea.id}`}>Cantidad</span>
            <div className="cantidad" role="group" aria-labelledby={`cant-${linea.id}`}>
              <button type="button" aria-label="Restar uno" disabled={pendiente}
                onClick={() => correr(() => (linea.cantidad > 1 ? actualizarLinea(linea.id, { cantidad: linea.cantidad - 1 }) : quitarLinea(linea.id)))}>−</button>
              <input readOnly value={linea.cantidad} aria-label="Cantidad" />
              <button type="button" aria-label="Sumar uno" disabled={pendiente}
                onClick={() => correr(() => actualizarLinea(linea.id, { cantidad: linea.cantidad + 1 }))}>+</button>
            </div>
          </div>
          <button type="button" className="enlace" disabled={pendiente} onClick={() => correr(() => quitarLinea(linea.id))} style={{ minHeight: 44 }}>Quitar</button>
        </div>
        <div role="status" aria-live="polite">
          {aviso?.error && <p className="aviso error" style={{ marginTop: 8, padding: "8px 12px" }}>{aviso.error}</p>}
          {aviso?.ok && <span className="sr-only">{aviso.ok}</span>}
        </div>
      </div>
      <span className="precio">{formatoPesos(linea.subtotal)}</span>
    </div>
  );
}

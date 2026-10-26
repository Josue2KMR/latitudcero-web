"use client";
import { useState, useTransition } from "react";
import { cambiarEstadoPedido } from "@/app/acciones";
import { ETIQUETA_ESTADO, type EstadoPedido } from "@/domain/pedido";

/** Botones del panel para avanzar un pedido. "En camino" pide el número de seguimiento. */
export function AccionesPedido({ numero, siguientes }: { numero: string; siguientes: EstadoPedido[] }) {
  const [tracking, setTracking] = useState("");
  const [aviso, setAviso] = useState<{ ok?: string; error?: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  if (!siguientes.length) return <span className="suave">—</span>;
  return (
    <div className="pila" style={{ gap: 8 }}>
      {siguientes.includes("en_camino") && (
        <input aria-label={`Seguimiento del pedido ${numero}`} placeholder="Nº de seguimiento" value={tracking} onChange={(e) => setTracking(e.target.value)}
          style={{ minHeight: 40, border: "1.5px solid var(--borde-campo)", borderRadius: 8, padding: "6px 10px" }} />
      )}
      <div className="fila" style={{ gap: 6 }}>
        {siguientes.map((s) => (
          <button key={s} type="button" className={`boton chico ${s === "cancelado" ? "secundario" : ""}`} disabled={pendiente}
            onClick={() => iniciar(async () => setAviso(await cambiarEstadoPedido(numero, s, { trackingCodigo: tracking })))}>
            {s === "cancelado" ? "Cancelar" : ETIQUETA_ESTADO[s]}
          </button>
        ))}
      </div>
      <div role="status">{aviso?.error && <span className="campo"><span className="error">{aviso.error}</span></span>}</div>
    </div>
  );
}

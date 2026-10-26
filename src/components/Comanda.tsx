import { formatoPesos, pesoCorto } from "@/domain/cafe";
import { ETIQUETA_ESTADO, pasosSeguimiento, type Pedido } from "@/domain/pedido";
import { IconoCheck } from "./Iconos";

/**
 * La comanda: lo que el cliente necesita y nada más.
 * Quién compró, qué se llevó, cuánto se cobró, cómo lo recibe y en qué paso está.
 * Si eligió retiro, el código grande es el ticket que muestra en el punto de entrega.
 */
export function Comanda({ pedido }: { pedido: Pedido }) {
  const pasos = pasosSeguimiento(pedido.entrega.tipo);
  const actual = pasos.findIndex((p) => p.estado === pedido.estado);
  const cancelado = pedido.estado === "cancelado";

  return (
    <article className="ticket" aria-labelledby="titulo-comanda">
      <header className="encabezado">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/emblema.svg" alt="" />
        <div className="crece">
          <span style={{ fontSize: ".85rem", opacity: 0.9 }}>Latitud Cero · Comanda</span>
          <h1 id="titulo-comanda" style={{ fontSize: "1.7rem", color: "inherit" }}>{pedido.numero}</h1>
        </div>
        <span className="chip" style={{ background: "var(--n-0)", color: "var(--accion)", borderColor: "var(--n-0)" }}>{ETIQUETA_ESTADO[pedido.estado]}</span>
      </header>

      <section className="bloque">
        <span className="eyebrow">Cliente</span>
        <p><strong>{pedido.clienteNombre}</strong> · {pedido.clienteEmail}</p>
      </section>

      <section className="bloque" aria-label="Productos">
        {pedido.items.map((i, k) => (
          <div className="item" key={k}>
            <span>{i.cantidad} × {i.nombre} {pesoCorto(i.pesoGramos)}<br /><span className="suave" style={{ fontSize: ".9rem" }}>Molienda {i.molienda.toLowerCase()}</span></span>
            <span className="dato">{formatoPesos(i.precioUnitario * i.cantidad)}</span>
          </div>
        ))}
        {pedido.entrega.tipo === "envio" && (
          <div className="item suave"><span>Envío</span><span className="dato">{pedido.costoEnvio ? formatoPesos(pedido.costoEnvio) : "Sin costo"}</span></div>
        )}
        <div className="item" style={{ fontWeight: 700, fontSize: "1.15rem", borderTop: "1.5px solid var(--n-900)", marginTop: 6, paddingTop: 10 }}>
          <span>Cobrado</span><span className="dato">{formatoPesos(pedido.total)}</span>
        </div>
        <p className="suave" style={{ fontSize: ".9rem" }}>{pedido.medioPago}</p>
      </section>

      {pedido.entrega.tipo === "retiro" ? (
        <section className="bloque pila" style={{ gap: 10 }}>
          <span className="eyebrow">Ticket de retiro</span>
          <div className="codigo" aria-label={`Código de retiro ${pedido.entrega.codigoRetiro?.split("").join(" ")}`}>{pedido.entrega.codigoRetiro}</div>
          <p>Mostrá este código en <strong>{pedido.entrega.puntoRetiro}</strong> cuando el pedido esté listo para retirar.</p>
        </section>
      ) : (
        <section className="bloque pila" style={{ gap: 6 }}>
          <span className="eyebrow">Envío a</span>
          <p>{pedido.entrega.direccion}</p>
          {pedido.entrega.tracking && <p>Seguimiento: <strong className="dato">{pedido.entrega.tracking.empresa} {pedido.entrega.tracking.codigo}</strong></p>}
        </section>
      )}

      <section className="bloque">
        <span className="eyebrow" id="titulo-seguimiento">Dónde está tu pedido</span>
        {cancelado ? (
          <p className="aviso error" style={{ marginTop: 10 }}>Este pedido fue cancelado.</p>
        ) : (
          <ol className="pasos" aria-labelledby="titulo-seguimiento" style={{ marginTop: 12 }}>
            {pasos.map((p, i) => {
              const estado = i <= actual ? "hecho" : i === actual + 1 ? "actual" : "pendiente";
              const fecha = pedido.historial.find((h) => h.estado === p.estado)?.en;
              return (
                <li key={p.estado} data-estado={estado} aria-current={estado === "actual" ? "step" : undefined}>
                  <span className="marca-paso">{estado === "hecho" ? <IconoCheck /> : i + 1}</span>
                  <div>
                    <strong>{p.titulo}</strong>
                    {fecha && <div className="suave" style={{ fontSize: ".85rem" }}>{new Date(fecha).toLocaleString("es-UY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </article>
  );
}
